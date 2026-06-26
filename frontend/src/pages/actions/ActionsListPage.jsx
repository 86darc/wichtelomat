import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { getMyActions } from '../../services/actionsService'
import { formatDate } from '../../utils/dateFormatter'

function ActionsListPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { session } = useAuth()
    const [actions, setActions] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadActions()
    }, [])

    async function loadActions() {
        try {
            const data = await getMyActions()
            setActions(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const displayName = session?.user?.user_metadata?.display_name || session?.user?.email || '?'
    const initial = displayName.charAt(0).toUpperCase()
    const avatarUrl = session?.user?.user_metadata?.avatar_url

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>{t('actions.myActions')}</h1>
                <Link to="/profile" className="avatar-btn" title={t('profile.title')}>
                    {avatarUrl
                        ? <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : initial
                    }
                </Link>
            </header>

            <Link to="/actions/new" className="btn-primary">
                {t('actions.create')}
            </Link>

            {error && <p className="error-msg">{error}</p>}
            {loading && <p>{t('app.loading')}</p>}

            <div className="actions-grid">
                {actions.map(action => (
                    <Link key={action.id} to={`/actions/${action.id}`} className="action-card">
                        <div className="action-card-top">
                            <h3>{action.name}</h3>
                            <span className={`status-badge status-${action.status.toLowerCase()}`}>
                                {t(`actions.status.${action.status}`)}
                            </span>
                        </div>
                        <p className="action-card-date">{formatDate(action.handover_date)}</p>
                    </Link>
                ))}
            </div>

            {!loading && actions.length === 0 && (
                <p>{t('actions.noActions')}</p>
            )}
        </div>
    )
}

export default ActionsListPage
