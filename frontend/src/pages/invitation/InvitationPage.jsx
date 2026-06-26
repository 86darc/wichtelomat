import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { getInvitation, acceptInvitation } from '../../services/invitationService'

function InvitationPage() {
    const { token } = useParams()
    const { t } = useTranslation()
    const { session, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [invitation, setInvitation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [joining, setJoining] = useState(false)

    useEffect(() => {
        let isMounted = true
        getInvitation(token)
            .then(data => { if (isMounted) setInvitation(data) })
            .catch(err => { if (isMounted) setError(err.message) })
            .finally(() => { if (isMounted) setLoading(false) })
        return () => { isMounted = false }
    }, [token])

    async function handleJoin() {
        setJoining(true)
        setError(null)
        try {
            const result = await acceptInvitation(token)
            navigate(`/actions/${result.action_id}`)
        } catch (err) {
            setError(t(`errors.${err.message}`) !== `errors.${err.message}`
                ? t(`errors.${err.message}`)
                : err.message)
        } finally {
            setJoining(false)
        }
    }

    if (authLoading || loading) {
        return <div className="auth-container"><p>{t('app.loading')}</p></div>
    }

    if (error && !invitation) {
        return (
            <div className="auth-container">
                <p className="error-msg">{error}</p>
                <Link to="/">{t('actions.backToList')}</Link>
            </div>
        )
    }

    const actionName = invitation?.wichtel_aktionen?.name || '—'
    const isExpired = invitation && (
        invitation.status !== 'PENDING' || new Date(invitation.expires_at) < new Date()
    )

    return (
        <div className="auth-container">
            <h1>{t('invite.title')}</h1>
            <p className="invitation-action-name">{actionName}</p>

            {isExpired ? (
                <p className="error-msg">{t('errors.invitationExpired')}</p>
            ) : session ? (
                <>
                    {error && <p className="error-msg">{error}</p>}
                    <button
                        className="btn-full"
                        onClick={handleJoin}
                        disabled={joining}
                    >
                        {joining ? t('app.loading') : t('invite.joinAction')}
                    </button>
                </>
            ) : (
                <>
                    <p>{t('invite.loginToJoin')}</p>
                    <div className="auth-links">
                        <Link to={`/login?redirect=/invitation/${token}`}>{t('auth.login')}</Link>
                        <Link to={`/register?redirect=/invitation/${token}`}>{t('auth.register')}</Link>
                    </div>
                </>
            )}
        </div>
    )
}

export default InvitationPage
