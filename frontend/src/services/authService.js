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
    const { error } = await supabase.auth.updateUser({
        email,
        data: { display_name: displayName }
    })
    if (error) throw error
}