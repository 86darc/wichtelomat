import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { register } from '../../services/authService'

function RegisterPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await register(email, password, name)
            setSuccess(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-container">
                <h1>{t('auth.register')}</h1>
                <p>Bitte bestätige deine E-Mail-Adresse über den Link den wir dir gesendet haben.</p>
                <Link to="/login">{t('auth.login')}</Link>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <h1>{t('auth.register')}</h1>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('auth.name')}
                    required
                />
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
                    minLength={8}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? t('app.loading') : t('auth.register')}
                </button>
            </form>
            <div className="auth-links">
                <Link to="/login">{t('auth.login')}</Link>
            </div>
        </div>
    )
}

export default RegisterPage