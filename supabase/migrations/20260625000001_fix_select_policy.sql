-- SELECT-Policy für wichtel_aktionen erweitern.
-- Problem (PostgREST v12+): INSERT mit RETURNING * schlägt fehl wenn der
-- nachfolgende SELECT durch RLS geblockt wird (42501). Der Ersteller einer
-- neuen Aktion ist noch kein Mitglied wenn RETURNING ausgeführt wird.
-- Fix: Ersteller darf seine eigene Aktion direkt nach Erstellung sehen.

DROP POLICY IF EXISTS "members see their actions" ON wichtel_aktionen;

CREATE POLICY "members see their actions" ON wichtel_aktionen
FOR SELECT
TO authenticated
USING (
  is_member_of(id) OR
  (SELECT auth.uid() AS uid) = created_by
);
