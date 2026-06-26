import { supabase } from '../utils/supabaseClient'

// UC-01: Registrieren
export async function register(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: displayName } }
    })
    if (error) throw error
    return data
}

// UC-02: Anmelden
export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

// Abmelden
export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

// UC-03: Passwort-Reset-Mail senden
export async function sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw error
}

// UC-03: Neues Passwort setzen
export async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
}

// UC-04: Profil aktualisieren
export async function updateProfile(displayName, email) {
    const updates = { data: { display_name: displayName } }
    if (email) updates.email = email
    const { error } = await supabase.auth.updateUser(updates)
    if (error) throw error
}

// Avatar hochladen (Supabase Storage, Bucket: 'avatars')
export async function updateAvatar(file, userId) {
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`

    const { error } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } })
    if (error) throw error
    return avatarUrl
}