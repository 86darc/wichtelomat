import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { getAction, getMemberships, updateAction } from '../../services/actionsService'
import { startDraw } from '../../services/drawService'

const TABS = [
    { key: 'members',    labelKey: 'members.title' },
    { key: 'exclusions', labelKey: 'exclusions.title' },
    { key: 'settings',   labelKey: 'actions.settingsTab' },
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
    const [starting, setStarting] = useState(false)
    const [drawError, setDrawError] = useState(null)

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
    const myMembership = memberships.find(m => m.user_id === currentUserId)
    const isAdmin = myMembership?.role_in_action === 'ADMIN'
    const canStart = isAdmin && action?.status === 'SETUP' && memberships.length >= 2

    async function handleStart() {
        if (!window.confirm(t('actions.confirmStart'))) return
        setStarting(true)
        setDrawError(null)
        try {
            await startDraw(action.id)
            loadData()
        } catch (err) {
            setDrawError(err.message)
        } finally {
            setStarting(false)
        }
    }

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

                {activeTab === 'settings' && (
                    <VorgabenTab
                        action={action}
                        isAdmin={isAdmin}
                        onUpdate={loadData}
                        t={t}
                    />
                )}

                {(activeTab === 'exclusions' || activeTab === 'wishlist' || activeTab === 'assignment') && (
                    <p className="text-muted">{t('app.comingSoon')}</p>
                )}
            </div>

            {isAdmin && action.status === 'SETUP' && (
                <div className="action-footer">
                    {memberships.length < 2 && (
                        <p className="text-muted">{t('actions.minMembers')}</p>
                    )}
                    {drawError && <p className="error-msg">{drawError}</p>}
                    <button
                        className="btn-danger"
                        onClick={handleStart}
                        disabled={!canStart || starting}
                    >
                        {starting ? t('app.loading') : t('actions.start')}
                    </button>
                </div>
            )}
        </div>
    )
}

function VorgabenTab({ action, isAdmin, onUpdate, t }) {
    const [date, setDate] = useState(action.handover_date)
    const [cost, setCost] = useState(action.max_cost ?? '')
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState(null)

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        setSaveMsg(null)
        try {
            await updateAction(action.id, {
                handover_date: date,
                max_cost: cost === '' ? null : Number(cost)
            })
            setSaveMsg('ok')
            onUpdate()
        } catch (err) {
            setSaveMsg(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="vorgaben-tab">
            {isAdmin && action.status === 'SETUP' ? (
                <form className="form-vertical" onSubmit={handleSave}>
                    <label>
                        {t('actions.handoverDate')}
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        {t('actions.maxCost')}
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cost}
                            onChange={e => setCost(e.target.value)}
                            placeholder="—"
                        />
                    </label>
                    <button type="submit" disabled={saving}>
                        {saving ? t('app.loading') : t('actions.saveSettings')}
                    </button>
                    {saveMsg === 'ok' && <p className="success-msg">{t('actions.settingsSaved')}</p>}
                    {saveMsg && saveMsg !== 'ok' && <p className="error-msg">{saveMsg}</p>}
                </form>
            ) : (
                <div className="vorgaben-readonly">
                    <p>{t('actions.handoverDate')}: <strong>{action.handover_date}</strong></p>
                    {action.max_cost && <p>{t('actions.maxCost')}: <strong>CHF {Number(action.max_cost).toFixed(2)}</strong></p>}
                    <p className="text-muted">{t('actions.settingsLocked')}</p>
                </div>
            )}
        </div>
    )
}

export default ActionDetailPage
