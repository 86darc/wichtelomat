-- RLS-Policies für INSERT-Operationen korrigieren.
-- Problem: Policies ohne TO authenticated + direktes auth.uid() können in PostgREST
-- als NULL ausgewertet werden, weil der Query-Planner den Aufruf wegoptimiert.
-- Fix: Explizit TO authenticated + sub-select Syntax erzwingt korrekte Auswertung.

DROP POLICY IF EXISTS "auth users create actions" ON wichtel_aktionen;

CREATE POLICY "auth users create actions" ON wichtel_aktionen
FOR INSERT
TO authenticated
WITH CHECK (( SELECT auth.uid() AS uid) = created_by);
