import { supabase } from '../utils/supabaseClient'

export async function startDraw(actionId) {
    const { data, error } = await supabase
        .rpc('draw_assignments', { p_action_id: actionId })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data
}
