-- Zustandswerte für Aktionen
CREATE TYPE action_status AS ENUM ('SETUP', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- Rollen innerhalb einer Aktion
CREATE TYPE role_in_action AS ENUM ('ADMIN', 'MEMBER');

-- Status einer Einladung
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- Erstellen aller Tabellen
CREATE TABLE wichtel_aktionen (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    TEXT NOT NULL,
    status                  action_status NOT NULL DEFAULT 'SETUP',
    max_cost                NUMERIC(10,2),                                  --optional
    handover_date           DATE NOT NULL,                                  --Pflichtfeld
    created_by              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memberships (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id               UUID NOT NULL REFERENCES wichtel_aktionen(id) ON DELETE CASCADE,
    user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_in_action          role_in_action NOT NULL DEFAULT 'MEMBER',
    is_guest                BOOLEAN NOT NULL DEFAULT FALSE,
    guest_email             TEXT,
    joined_at               TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(action_id, user_id)
);

CREATE TABLE exclusions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id               UUID NOT NULL REFERENCES wichtel_aktionen(id) ON DELETE CASCADE,
    giver_membership_id     UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    excluded_membership_id  UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    UNIQUE(action_id, giver_membership_id, excluded_membership_id)
);

CREATE TABLE assignments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id               UUID NOT NULL REFERENCES wichtel_aktionen(id) ON DELETE CASCADE,
    giver_membership_id     UUID UNIQUE REFERENCES memberships(id) ON DELETE CASCADE,
    receiver_membership_id  UUID UNIQUE REFERENCES memberships(id) ON DELETE CASCADE
);

CREATE TABLE wishlists (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id           UUID UNIQUE NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    content                 TEXT DEFAULT '',
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invitations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id               UUID NOT NULL REFERENCES wichtel_aktionen(id) ON DELETE CASCADE,
    guest_email             TEXT NOT NULL,
    token                   TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
    status                  invitation_status NOT NULL DEFAULT 'PENDING',
    expires_at              TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '3 months',
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE member_access_tokens (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id           UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    token                   TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
    expires_at              TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 year'
);

-- RLS aktivieren für alle Tabellen
 ALTER TABLE wichtel_aktionen       ENABLE ROW LEVEL SECURITY;
 ALTER TABLE memberships            ENABLE ROW LEVEL SECURITY;
 ALTER TABLE exclusions             ENABLE ROW LEVEL SECURITY;
 ALTER TABLE assignments            ENABLE ROW LEVEL SECURITY;
 ALTER TABLE wishlists              ENABLE ROW LEVEL SECURITY;
 ALTER TABLE invitations            ENABLE ROW LEVEL SECURITY;
 ALTER TABLE member_access_tokens   ENABLE ROW LEVEL SECURITY;

-- wichtel_aktionen

-- Nur eigene Aktionen sehen
CREATE POLICY "members see their actions" ON wichtel_aktionen FOR SELECT USING (id IN (SELECT action_id FROM memberships WHERE user_id = auth.uid()));

-- Nur angemeldete User dürfen Aktionen erstellen
CREATE POLICY "auth users create actions" ON wichtel_aktionen FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Nur der Admin darf die Aktion updaten
CREATE POLICY "admin updates action" ON wichtel_aktionen FOR UPDATE USING (id IN (SELECT action_id FROM memberships WHERE user_id = auth.uid() AND role_in_action = 'ADMIN'));

-- memberships

-- Mitglieder sehe alle Mitglieder ihrer Aktionen
CREATE POLICY "members see co-members" ON memberships FOR SELECT USING (action_id IN (SELECT action_id FROM memberships WHERE user_id = auth.uid()));

-- Nur admin darf Mitglieder hinzufügen
CREATE POLICY "admin inserts members" ON memberships FOR INSERT WITH CHECK (action_id IN (SELECT action_id FROM memberships WHERE user_id = auth.uid() AND role_in_action = 'ADMIN'));

-- Nur Admin darf Mitglieder entfernen
CREATE POLICY "admin deletes members" ON memberships FOR DELETE USING (action_id IN (SELECT action_id FROM memberships WHERE user_id = auth.uid() AND role_in_action = 'ADMIN'));

-- assignments

-- Jedes Mitglied sieht NUR seine eigene Zuweisung (wem es wichteln muss)
CREATE POLICY "member sees own assignment only" ON assignments FOR SELECT USING (giver_membership_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()));

-- Niemand darf Assignments direkt schreiben (nur via RPC-Funktion)
-- Kein INSERT/UPDATE/DELETE Policy -> komplett gesperrt für normale User

-- wishlists

-- Eigener Wunschzettel + Wunschzettel des Wichtel-Empfängers
CREATE POLICY "member sees own and assigned wishlist" ON wishlists FOR SELECT USING (membership_id IN (SELECT id FROM memberships WHERE user_id = auth.uid()) OR membership_id IN (
SELECT a.receiver_membership_id FROM assignments a JOIN memberships m on a.giver_membership_id = m.id WHERE m.user_id = auth.uid()));

-- Wunschzettel nur schreiben wenn Aktion noch in SETUP ist
CREATE POLICY "member edits wishlist in SETUP only" ON wishlists FOR ALL USING (membership_id IN (
SELECT m.id FROM memberships m JOIN wichtel_aktionen wa ON m.action_id = wa.id WHERE m.user_id = auth.uid() AND wa.status = 'SETUP'));

-- invitations

-- Einladungen sind öffentlich lesbar (für Einladungslink-Flow)
CREATE POLICY "anyone reads invitations by token" ON invitations FOR SELECT USING (true);

-- Nur Admin darf Einladungen erstellen
CREATE POLICY "admin creates invitations" ON invitations FOR INSERT WITH CHECK (action_id IN (SELECT action_id FROM memberships WHERE user_id = auth.uid() AND role_in_action = 'ADMIN'));

-- RPC-Funktion für die Auslosung
CREATE OR REPLACE FUNCTION draw_assignments(p_action_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER    -- läuft mit DB-Rechten, umgeht RLS
AS $$
DECLARE
v_action            wichtel_aktionen%ROWTYPE;
v_members           UUID[];
v_receivers         UUID[];
v_excl_giver        UUID;
v_excl_excluded     UUID;
v_attempt           INT := 0;
v_valid             BOOLEAN;
v_i                 INT;
v_tmp               UUID;
v_swap_idx          INT;
BEGIN

-- 1. Aktion prüfen
SELECT * INTO v_action FROM wichtel_aktionen WHERE id = p_action_id;
IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Aktion nicht gefunden');
END IF;
IF v_action.status != 'SETUP' THEN RETURN jsonb_build_object('error', 'Aktion nicht im Status SETUP');
END IF;
IF v_action.handover_date IS NULL THEN RETURN jsonb_build_object('error', 'Übergabedatum fehlt');
END IF;

-- 2. Mitglieder laden
SELECT ARRAY(SELECT id FROM memberships WHERE action_id = p_action_id) INTO v_members;
IF array_length(v_members, 1) < 2 THEN RETURN jsonb_build_object('error', 'Mindestens 2 Mitglieder nötig');
END IF;

-- 3. Auslosungs-Algorithmus (Shuffle mit max. 1000 Versuchen)
LOOP v_attempt := v_attempt + 1;
IF v_attempt > 1000 THEN RETURN jsonb_build_object('error', 'Zu viele Ausschlüsse - bitte überarbeiten');
END IF;

-- Receiver-Array zufällig mischen (Fisher-Yates)
v_receivers := v_members;
FOR v_i IN 1..array_length(v_members, 1) LOOP
v_swap_idx := v_i + floor(random() * (array_length(v_receivers,1) - v_i +
1))::INT;
v_tmp := v_receivers[v_i];
v_receivers[v_i] := v_receivers[v_swap_idx];
v_receivers[v_swap_idx] := v_tmp;
END LOOP;

-- Zuweisung validieren
v_valid := TRUE;
FOR v_i IN 1..array_length(v_members, 1) LOOP

-- Keine Selbst-Zuweisung
IF v_members[v_i] = v_receivers[v_i] THEN v_valid := FALSE; EXIT;
END IF;

-- Ausschlüsse prüfen
IF EXISTS (SELECT 1 FROM exclusions WHERE action_id = p_action_id AND giver_membership_id = v_members[v_i] AND excluded_membership_id = v_receivers[v_i]
) THEN v_valid := FALSE; EXIT;
END IF;
END LOOP;
EXIT WHEN v_valid;
END LOOP;

-- 4. Assignments in Transatkion speichern
FOR v_i IN 1..array_length(v_members, 1) LOOP INSERT INTO assignments(action_id, giver_membership_id, receiver_membership_id) VALUES (p_action_id, v_members[v_i], v_receivers[v_i]);
END LOOP;

-- 5. Aktionsstatus auf ACTIVE setzen
UPDATE wichtel_aktionen SET status = 'ACTIVE' WHERE id = p_action_id;

RETURN jsonb_build_object('success', true, 'attempts', v_attempt);
END;
$$;
