import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMyActions } from '../../services/actionsService'
import { logout } from '../../services/authService'

function ActionsListPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
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

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    function formatDate(dateStr) {
        if (!dateStr) return ''
        const [y, m, d] = dateStr.split('-')
        return `${d}.${m}.${y}`
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>{t('actions.myActions')}</h1>
                <button className="btn-logout" onClick={handleLogout}>{t('auth.logout')}</button>
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
                <p>Noch keine Aktionen vorhanden.</p>
            )}
        </div>
    )
}

export default ActionsListPage
