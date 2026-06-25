-- Hilfsfunktionen die RLS umgehen (verhindern Rekursion)
CREATE OR REPLACE FUNCTION is_member_of(p_action_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE action_id = p_action_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_admin_of(p_action_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE action_id = p_action_id
    AND user_id = auth.uid()
    AND role_in_action = 'ADMIN'
  );
$$;

-- Alte (rekursive) Policies löschen
DROP POLICY IF EXISTS "members see their actions" ON wichtel_aktionen;
DROP POLICY IF EXISTS "admin updates action" ON wichtel_aktionen;
DROP POLICY IF EXISTS "members see co-members" ON memberships;
DROP POLICY IF EXISTS "admin inserts members" ON memberships;
DROP POLICY IF EXISTS "admin deletes members" ON memberships;

-- Neue Policies mit Hilfsfunktionen (keine Rekursion mehr)
CREATE POLICY "members see their actions" ON wichtel_aktionen FOR SELECT
  USING (is_member_of(id));

CREATE POLICY "admin updates action" ON wichtel_aktionen FOR UPDATE
  USING (is_admin_of(id));

CREATE POLICY "members see co-members" ON memberships FOR SELECT
  USING (is_member_of(action_id));

CREATE POLICY "admin inserts members" ON memberships FOR INSERT
  WITH CHECK (is_admin_of(action_id) OR user_id = auth.uid());

CREATE POLICY "admin deletes members" ON memberships FOR DELETE
  USING (is_admin_of(action_id));