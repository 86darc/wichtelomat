import { supabase } from '../utils/supabaseClient'

export async function createInvitation(actionId, email) {
    const { data, error } = await supabase
        .from('invitations')
        .insert({ action_id: actionId, guest_email: email })
        .select('id, token, guest_email, expires_at')
        .single()
    if (error) throw error
    return data
}

export async function getInvitation(token) {
    const { data, error } = await supabase
        .from('invitations')
        .select('id, action_id, guest_email, status, expires_at, wichtel_aktionen(name, handover_date)')
        .eq('token', token)
        .single()
    if (error) throw error
    return data
}

export async function acceptInvitation(token) {
    const { data, error } = await supabase
        .rpc('accept_invitation', { p_token: token })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data
}

export async function sendInvitationEmail(token, guestEmail, actionName) {
    const { error } = await supabase.functions.invoke('send-invitation-email', {
        body: { token, guestEmail, actionName }
    })
    if (error) throw error
}
