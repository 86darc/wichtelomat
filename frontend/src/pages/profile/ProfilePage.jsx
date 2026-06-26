import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfile, updateAvatar, updatePassword, logout } from '../../services/authService'

function ProfilePage() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [profileMsg, setProfileMsg] = useState(null)
    const [savingProfile, setSavingProfile] = useState(false)

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordMsg, setPasswordMsg] = useState(null)
    const [savingPassword, setSavingPassword] = useState(false)

    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null)
    const [avatarMsg, setAvatarMsg] = useState(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    const initial = (displayName || email || '?').charAt(0).toUpperCase()

    async function handleProfileSave(e) {
        e.preventDefault()
        setSavingProfile(true)
        setProfileMsg(null)
        try {
            await updateProfile(displayName, email !== user.email ? email : undefined)
            setProfileMsg('ok')
        } catch (err) {
            setProfileMsg(err.message)
        } finally {
            setSavingProfile(false)
        }
    }

    async function handlePasswordSave(e) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPasswordMsg(t('profile.passwordMismatch'))
            return
        }
        setSavingPassword(true)
        setPasswordMsg(null)
        try {
            await updatePassword(newPassword)
            setPasswordMsg('ok')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            setPasswordMsg(err.message)
        } finally {
            setSavingPassword(false)
        }
    }

    async function handleAvatarChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingAvatar(true)
        setAvatarMsg(null)
        try {
            const url = await updateAvatar(file, user.id)
            setAvatarUrl(url)
        } catch {
            setAvatarMsg(t('profile.avatarError'))
        } finally {
            setUploadingAvatar(false)
        }
    }

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>{t('profile.title')}</h1>
            </header>

            {/* Avatar */}
            <div className="profile-avatar-wrap">
                <div
                    className="profile-avatar-large"
                    onClick={() => fileInputRef.current?.click()}
                    title={t('profile.changeAvatar')}
                    style={{ cursor: 'pointer' }}
                >
                    {avatarUrl
                        ? <img src={avatarUrl} alt={displayName} className="profile-avatar-img" />
                        : initial
                    }
                </div>
                <button
                    type="button"
                    className="btn-secondary profile-avatar-change-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                >
                    {uploadingAvatar ? t('app.loading') : t('profile.changeAvatar')}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                />
                {avatarMsg && <p className="error-msg">{avatarMsg}</p>}
            </div>

            {/* Profil-Daten */}
            <form className="form-vertical profile-form" onSubmit={handleProfileSave}>
                <label>
                    {t('auth.name')}
                    <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                    />
                </label>
                <label>
                    {t('auth.email')}
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    {email !== user?.email && (
                        <small className="text-muted">{t('profile.emailNote')}</small>
                    )}
                </label>
                {profileMsg === 'ok' && <p className="success-msg">{t('profile.saved')}</p>}
                {profileMsg && profileMsg !== 'ok' && <p className="error-msg">{profileMsg}</p>}
                <button type="submit" className="btn-primary" disabled={savingProfile}>
                    {savingProfile ? t('app.loading') : t('profile.save')}
                </button>
            </form>

            {/* Passwort ändern */}
            <div className="profile-section-divider" />
            <form className="form-vertical profile-form" onSubmit={handlePasswordSave}>
                <h2 className="profile-section-title">{t('profile.passwordSection')}</h2>
                <label>
                    {t('profile.newPassword')}
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        minLength={6}
                        required
                    />
                </label>
                <label>
                    {t('profile.confirmPassword')}
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                </label>
                {passwordMsg === 'ok' && <p className="success-msg">{t('profile.passwordSaved')}</p>}
                {passwordMsg && passwordMsg !== 'ok' && <p className="error-msg">{passwordMsg}</p>}
                <button type="submit" className="btn-primary" disabled={savingPassword}>
                    {savingPassword ? t('app.loading') : t('profile.savePassword')}
                </button>
            </form>

            <div className="page-footer">
                <div className="page-footer-left">
                    <Link to="/" className="btn-secondary">← {t('actions.backToList')}</Link>
                </div>
                <div className="page-footer-right">
                    <button type="button" className="btn-cancel" onClick={handleLogout}>
                        {t('auth.logout')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
