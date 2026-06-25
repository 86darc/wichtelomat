-- Data-API-Zugriff für authentifizierte und anonyme Rollen freigeben.
-- RLS-Policies entscheiden danach welche ZEILEN sichtbar sind.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Für die Einladungs-Funktion brauchen anonyme User Lese-/Schreibzugriff auf invitations
GRANT INSERT, UPDATE ON invitations TO anon;
GRANT INSERT, UPDATE ON memberships TO anon;

-- RPC-Funktionen dürfen aufgerufen werden
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Auch für zukünftige Tabellen automatisch freigeben
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;