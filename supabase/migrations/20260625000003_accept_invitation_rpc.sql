CREATE OR REPLACE FUNCTION accept_invitation(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_inv invitations%ROWTYPE;
    v_uid UUID := auth.uid();
BEGIN
    SELECT * INTO v_inv FROM invitations WHERE token = p_token;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'invitation_not_found');
    END IF;

    IF v_inv.status <> 'PENDING' THEN
        RETURN json_build_object('error', 'invitation_already_used');
    END IF;

    IF v_inv.expires_at < NOW() THEN
        UPDATE invitations SET status = 'EXPIRED' WHERE id = v_inv.id;
        RETURN json_build_object('error', 'invitation_expired');
    END IF;

    IF EXISTS (
        SELECT 1 FROM memberships
        WHERE action_id = v_inv.action_id AND user_id = v_uid
    ) THEN
        RETURN json_build_object('action_id', v_inv.action_id::TEXT, 'already_member', true);
    END IF;

    INSERT INTO memberships (action_id, user_id, role_in_action)
    VALUES (v_inv.action_id, v_uid, 'MEMBER');

    UPDATE invitations SET status = 'ACCEPTED' WHERE id = v_inv.id;

    RETURN json_build_object('action_id', v_inv.action_id::TEXT);
END;
$$;

GRANT EXECUTE ON FUNCTION accept_invitation(TEXT) TO authenticated;
