import { supabase } from '../utils/supabaseClient'

// CREATE: Neue Aktion + Admin-Membership (UC-05)
export async function createAction(name, handoverDate, maxCost = null) {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    const { data: action, error: e1 } = await supabase
        .from('wichtel_aktionen')
        .insert({
            name,
            handover_date: handoverDate,
            max_cost: maxCost,
            created_by: user.id
        })
        .select()
        .single()
    if (e1) throw e1

    const { error: e2 } = await supabase
        .from('memberships')
        .insert({
            action_id: action.id,
            user_id: user.id,
            role_in_action: 'ADMIN'
        })
    if (e2) throw e2

    return action
}

// READ: Alle eigenen Aktionen
export async function getMyActions() {
    const { data, error } = await supabase
        .from('wichtel_aktionen')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

// READ: Einzelne Aktion
export async function getAction(actionId) {
    const { data, error } = await supabase
        .from('wichtel_aktionen')
        .select('*')
        .eq('id', actionId)
        .single()
    if (error) throw error
    return data
}

// UPDATE: Vorgaben aktualisieren (UC-11)
export async function updateAction(actionId, updates) {
    const { data, error } = await supabase
        .from('wichtel_aktionen')
        .update(updates)
        .eq('id', actionId)
        .select()
        .single()
    if (error) throw error
    return data
}

// DELETE: Aktion abbrechen (UC-14) – Cascade löscht abhängige Daten
export async function cancelAction(actionId) {
    const { error } = await supabase
        .from('wichtel_aktionen')
        .delete()
        .eq('id', actionId)
    if (error) throw error
}

// READ: Mitglieder einer Aktion inkl. Display-Name aus profiles
export async function getMemberships(actionId) {
    const { data: members, error } = await supabase
        .from('memberships')
        .select('id, user_id, role_in_action, is_guest, guest_email, joined_at')
        .eq('action_id', actionId)
        .order('joined_at', { ascending: true })
    if (error) throw error

    const userIds = members.filter(m => m.user_id).map(m => m.user_id)
    if (userIds.length === 0) return members

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds)

    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
    return members.map(m => ({
        ...m,
        display_name: profileMap[m.user_id]?.display_name || null
    }))
}