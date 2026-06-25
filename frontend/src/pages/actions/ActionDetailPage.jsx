import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { getAction, getMemberships } from '../../services/actionsService'

const TABS = [
    { key: 'members',    labelKey: 'members.title' },
    { key: 'exclusions', labelKey: 'exclusions.title' },
    { key: 'wishlist',   labelKey: 'wishlist.title' },
    { key: 'assignment', labelKey: 'assignment.title' },
]

function ActionDetailPage() {
    const { id } = useParams()
    const { t } = useTranslation()
    const { session } = useAuth()
    const [action, setAction] = useState(null)
    const [memberships, setMemberships] = useState([])
    const [activeTab, setActiveTab] = useState('members')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadData()
    }, [id])

    async function loadData() {
        try {
            const [actionData, membershipsData] = await Promise.all([
                getAction(id),
                getMemberships(id)
            ])
            setAction(actionData)
            setMemberships(membershipsData)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="page-container"><p>{t('app.loading')}</p></div>
    if (error) return <div className="page-container"><p className="error-msg">{error}</p></div>
    if (!action) return null

    const currentUserId = session?.user?.id

    return (
        <div className="page-container">
            <Link to="/" className="back-link">← {t('actions.backToList')}</Link>

            <div className="action-detail-header">
                <div>
                    <h1>{action.name}</h1>
                    <div className="action-meta">
                        <span>{t('actions.handoverDate')}: {action.handover_date}</span>
                        {action.max_cost && (
                            <span>{t('actions.maxCost')}: CHF {Number(action.max_cost).toFixed(2)}</span>
                        )}
                    </div>
                </div>
                <span className={`status-badge status-${action.status.toLowerCase()}`}>
                    {t(`actions.status.${action.status}`)}
                </span>
            </div>

            <nav className="tab-nav">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-btn${activeTab === tab.key ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {t(tab.labelKey)}
                    </button>
                ))}
            </nav>

            <div className="tab-content">
                {activeTab === 'members' && (
                    <ul className="member-list">
                        {memberships.map(m => (
                            <li key={m.id} className="member-item">
                                <span className="member-name">
                                    {m.is_guest ? m.guest_email : (m.display_name || '—')}
                                    {m.user_id === currentUserId && (
                                        <span className="member-you"> ({t('members.you')})</span>
                                    )}
                                </span>
                                <span className={`role-badge role-${m.role_in_action.toLowerCase()}`}>
                                    {t(`members.role.${m.role_in_action}`)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                {activeTab !== 'members' && (
                    <p className="text-muted">{t('app.comingSoon')}</p>
                )}
            </div>
        </div>
    )
}

export default ActionDetailPage
