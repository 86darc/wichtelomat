-- Profiles-Tabelle für öffentlich lesbare Nutzerdaten (Display-Name).
-- Wird bei jeder Registrierung automatisch befüllt (Trigger handle_new_user).

CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles readable by authenticated" ON profiles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "users update own profile" ON profiles
FOR UPDATE TO authenticated USING (id = auth.uid());

-- Trigger: Profil automatisch bei Registrierung erstellen
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

GRANT SELECT ON profiles TO authenticated;

-- Bestehende User nachfüllen
INSERT INTO profiles (id, display_name)
SELECT id, COALESCE(raw_user_meta_data->>'name', email)
FROM auth.users
ON CONFLICT (id) DO NOTHING;
