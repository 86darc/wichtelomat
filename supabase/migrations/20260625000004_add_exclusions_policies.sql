CREATE POLICY "members see exclusions" ON exclusions FOR SELECT
USING (action_id IN (
    SELECT action_id FROM memberships WHERE user_id = auth.uid()
));

CREATE POLICY "admin creates exclusions" ON exclusions FOR INSERT
WITH CHECK (action_id IN (
    SELECT action_id FROM memberships WHERE user_id = auth.uid() AND role_in_action = 'ADMIN'
));

CREATE POLICY "admin deletes exclusions" ON exclusions FOR DELETE
USING (action_id IN (
    SELECT action_id FROM memberships WHERE user_id = auth.uid() AND role_in_action = 'ADMIN'
));
