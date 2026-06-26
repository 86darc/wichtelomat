import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { updatePassword } from '../../services/authService'

function ResetPasswordPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await updatePassword(password)
            navigate('/login')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <h1>{t('auth.resetPassword')}</h1>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    minLength={8}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? t('app.loading') : t('auth.resetPassword')}
                </button>
            </form>
        </div>
    )
}

export default ResetPasswordPage