import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { login } from '../../services/authService'

function LoginPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const redirect = new URLSearchParams(location.search).get('redirect') || '/'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await login(email, password)
            navigate(redirect)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <h1>{t('auth.login')}</h1>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('auth.email')}
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? t('app.loading') : t('auth.login')}
                </button>
            </form>
            <div className="auth-links">
                <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
                <Link to="/register">{t('auth.noAccount')}</Link>
            </div>
        </div>
    )
}

export default LoginPage