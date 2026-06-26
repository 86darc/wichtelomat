import { supabase } from '../utils/supabaseClient'

export async function startDraw(actionId) {
    const { data, error } = await supabase
        .rpc('draw_assignments', { p_action_id: actionId })
    if (error) throw error
    if (data?.error) throw new Error(data.error)

    const { error: emailError } = await supabase.functions.invoke('send-assignment-email', {
        body: { action_id: actionId }
    })
    if (emailError) console.error('E-Mail-Versand fehlgeschlagen:', emailError)

    return data
}
