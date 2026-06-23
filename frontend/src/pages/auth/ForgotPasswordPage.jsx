import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { sendPasswordReset } from '../../services/authService'

function ForgotPasswordPage() {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [error, setError] = useState(null)
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await sendPasswordReset(email)
            setSent(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="auth-container">
                <h1>{t('auth.resetPassword')}</h1>
                <p>Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link gesendet.</p>
                <Link to="/login">{t('auth.login')}</Link>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <h1>{t('auth.resetPassword')}</h1>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('auth.email')}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? t('app.loading') : t('auth.resetPassword')}
                </button>
            </form>
            <div className="auth-links">
                <Link to="/login">{t('auth.login')}</Link>
            </div>
        </div>
    )
}

export default ForgotPasswordPage