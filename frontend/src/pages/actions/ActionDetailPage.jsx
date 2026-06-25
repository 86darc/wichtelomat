import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import {
    getAction, getMemberships, updateAction,
    getMyAssignment, getMyWishlist, saveWishlist,
    getExclusions, addExclusion, removeExclusion,
    getPendingInvitations
} from '../../services/actionsService'
import { startDraw } from '../../services/drawService'
import { createInvitation, sendInvitationEmail } from '../../services/invitationService'

const TABS = [
    { key: 'members',    labelKey: 'members.title' },
    { key: 'exclusions', labelKey: 'exclusions.title' },
    { key: 'settings',   labelKey: 'actions.settingsTab' },
    { key: 'wishlist',   labelKey: 'wishlist.title' },
    { key: 'assignment', labelKey: 'assignment.title' },
]

function formatDate(dateStr) {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    return `${d}.${m}.${y}`
}

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
            <div className="action-detail-header">
                <div>
                    <h1>{action.name}</h1>
                    <div className="action-meta">
                        <span>{formatDate(action.handover_date)}</span>
                        {action.max_cost && (
                            <>
                                <span className="action-meta-sep">·</span>
                                <span>CHF {Number(action.max_cost).toFixed(2)}</span>
                            </>
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
                    <MembersTab
                        memberships={memberships}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        action={action}
                        onUpdate={loadData}
                        t={t}
                    />
                )}

                {activeTab === 'settings' && (
                    <VorgabenTab
                        action={action}
                        isAdmin={isAdmin}
                        onUpdate={loadData}
                        t={t}
                    />
                )}

                {activeTab === 'assignment' && (
                    <AssignmentTab
                        action={action}
                        myMembership={myMembership}
                        t={t}
                    />
                )}

                {activeTab === 'wishlist' && (
                    <WishlistTab
                        action={action}
                        myMembership={myMembership}
                        t={t}
                    />
                )}

                {activeTab === 'exclusions' && (
                    <ExclusionsTab
                        action={action}
                        memberships={memberships}
                        isAdmin={isAdmin}
                        t={t}
                    />
                )}
            </div>

            {isAdmin && action.status === 'SETUP' && (
                <div>
                    {memberships.length < 2 && (
                        <p className="text-muted">{t('actions.minMembers')}</p>
                    )}
                    {drawError && <p className="error-msg">{drawError}</p>}
                    <button
                        className="btn-start-action"
                        onClick={handleStart}
                        disabled={!canStart || starting}
                    >
                        {starting ? t('app.loading') : t('actions.start')}
                    </button>
                </div>
            )}

            <div className="page-footer">
                <div className="page-footer-left">
                    <Link to="/" className="btn-secondary">← {t('actions.backToList')}</Link>
                </div>
                <div className="page-footer-right"></div>
            </div>
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

    if (!(isAdmin && action.status === 'SETUP')) {
        return (
            <div className="vorgaben-tab">
                <div className="vorgaben-readonly">
                    <p><strong>{formatDate(action.handover_date)}</strong></p>
                    {action.max_cost && <p>CHF <strong>{Number(action.max_cost).toFixed(2)}</strong></p>}
                    <p className="text-muted">{t('actions.settingsLocked')}</p>
                </div>
            </div>
        )
    }

    return (
        <form className="vorgaben-tab" onSubmit={handleSave}>
            <div className="vorgaben-grid">
                <div className="vorgaben-field">
                    <label>
                        {t('actions.handoverDate')}
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div className="vorgaben-field">
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
                </div>
            </div>
            {saveMsg === 'ok' && <p className="success-msg">{t('actions.settingsSaved')}</p>}
            {saveMsg && saveMsg !== 'ok' && <p className="error-msg">{saveMsg}</p>}
            <div className="form-footer">
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? t('app.loading') : t('actions.saveSettings')}
                </button>
            </div>
        </form>
    )
}

function AssignmentTab({ action, myMembership, t }) {
    const [assignment, setAssignment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (action.status === 'SETUP' || !myMembership) {
            setLoading(false)
            return
        }
        getMyAssignment(myMembership.id)
            .then(setAssignment)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [action.status, myMembership?.id])

    if (action.status === 'SETUP') {
        return <p className="text-muted">{t('app.comingSoon')}</p>
    }
    if (loading) return <p>{t('app.loading')}</p>
    if (error) return <p className="error-msg">{error}</p>
    if (!assignment) return null

    return (
        <div className="assignment-tab">
            <p className="assignment-label">{t('assignment.youGiftTo')}</p>
            <p className="assignment-receiver">{assignment.receiver_name}</p>
            {assignment.wishlist_content ? (
                <div className="assignment-wishlist">
                    <div className="wishlist-readonly">
                        <p className="wishlist-label">{t('wishlist.title')}</p>
                        <p className="wishlist-content">{assignment.wishlist_content}</p>
                    </div>
                </div>
            ) : (
                <p className="text-muted">{t('wishlist.empty')}</p>
            )}
        </div>
    )
}

function ExclusionsTab({ action, memberships, isAdmin, t }) {
    const [exclusions, setExclusions] = useState([])
    const [loading, setLoading] = useState(true)
    const [giverId, setGiverId] = useState('')
    const [excludedId, setExcludedId] = useState('')
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState(null)

    const memberMap = Object.fromEntries(
        memberships.map(m => [m.id, m.is_guest ? m.guest_email : (m.display_name || m.guest_email || '—')])
    )

    useEffect(() => {
        getExclusions(action.id)
            .then(setExclusions)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [action.id])

    async function handleAdd(e) {
        e.preventDefault()
        if (!giverId || !excludedId || giverId === excludedId) return
        setAdding(true)
        setError(null)
        try {
            await addExclusion(action.id, giverId, excludedId)
            const updated = await getExclusions(action.id)
            setExclusions(updated)
            setGiverId('')
            setExcludedId('')
        } catch (err) {
            setError(err.message)
        } finally {
            setAdding(false)
        }
    }

    async function handleRemove(id) {
        try {
            await removeExclusion(id)
            setExclusions(prev => prev.filter(ex => ex.id !== id))
        } catch (err) {
            setError(err.message)
        }
    }

    if (loading) return <p>{t('app.loading')}</p>

    const canEdit = isAdmin && action.status === 'SETUP'

    return (
        <div className="exclusions-tab">
            {exclusions.length === 0
                ? <p className="text-muted">{t('exclusions.none')}</p>
                : (
                    <ul className="exclusion-list">
                        {exclusions.map(ex => (
                            <li key={ex.id} className="exclusion-item">
                                <span>
                                    <strong>{memberMap[ex.giver_membership_id] || '—'}</strong>
                                    {' → '}
                                    <strong>{memberMap[ex.excluded_membership_id] || '—'}</strong>
                                </span>
                                {canEdit && (
                                    <button className="btn-remove" onClick={() => handleRemove(ex.id)}>
                                        {t('members.remove')}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )
            }

            {canEdit && (
                <form className="exclusion-form" onSubmit={handleAdd}>
                    <select value={giverId} onChange={e => setGiverId(e.target.value)} required>
                        <option value="">{t('exclusions.selectGiver')}</option>
                        {memberships.map(m => (
                            <option key={m.id} value={m.id}>{memberMap[m.id]}</option>
                        ))}
                    </select>
                    <span className="exclusion-arrow">→</span>
                    <select value={excludedId} onChange={e => setExcludedId(e.target.value)} required>
                        <option value="">{t('exclusions.selectExcluded')}</option>
                        {memberships.filter(m => m.id !== giverId).map(m => (
                            <option key={m.id} value={m.id}>{memberMap[m.id]}</option>
                        ))}
                    </select>
                    <button type="submit" className="btn-primary" disabled={adding}>
                        {adding ? t('app.loading') : t('exclusions.add')}
                    </button>
                    {error && <p className="error-msg">{error}</p>}
                </form>
            )}

            {!canEdit && action.status !== 'SETUP' && (
                <p className="text-muted">{t('exclusions.locked')}</p>
            )}
        </div>
    )
}

function WishlistTab({ action, myMembership, t }) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState(null)

    useEffect(() => {
        if (!myMembership) { setLoading(false); return }
        getMyWishlist(myMembership.id)
            .then(setContent)
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [myMembership?.id])

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        setSaveMsg(null)
        try {
            await saveWishlist(myMembership.id, content)
            setSaveMsg('ok')
        } catch (err) {
            setSaveMsg(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <p>{t('app.loading')}</p>

    const editable = action.status === 'SETUP'

    if (!editable) {
        return (
            <div className="wishlist-tab">
                <div className="wishlist-readonly">
                    {content
                        ? <p className="wishlist-content">{content}</p>
                        : <p className="text-muted">{t('wishlist.empty')}</p>
                    }
                </div>
            </div>
        )
    }

    return (
        <form className="wishlist-tab" onSubmit={handleSave}>
            <p className="text-muted">{t('wishlist.hint')}</p>
            <textarea
                className="wishlist-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={8}
                placeholder="…"
            />
            {saveMsg === 'ok' && <p className="success-msg">{t('actions.settingsSaved')}</p>}
            {saveMsg && saveMsg !== 'ok' && <p className="error-msg">{saveMsg}</p>}
            <div className="form-footer">
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? t('app.loading') : t('wishlist.save')}
                </button>
            </div>
        </form>
    )
}

function MembersTab({ memberships, currentUserId, isAdmin, action, onUpdate, t }) {
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteName, setInviteName] = useState('')
    const [inviting, setInviting] = useState(false)
    const [inviteLink, setInviteLink] = useState(null)
    const [inviteError, setInviteError] = useState(null)
    const [copied, setCopied] = useState(false)
    const [pendingInvitations, setPendingInvitations] = useState([])

    useEffect(() => {
        if (isAdmin) {
            getPendingInvitations(action.id)
                .then(setPendingInvitations)
                .catch(() => {})
        }
    }, [action.id, isAdmin])

    async function handleInvite(e) {
        e.preventDefault()
        setInviting(true)
        setInviteError(null)
        setInviteLink(null)
        try {
            const inv = await createInvitation(action.id, inviteEmail, inviteName)
            const link = `${window.location.origin}/invitation/${inv.token}`
            setInviteLink(link)
            setInviteEmail('')
            setInviteName('')
            try { await sendInvitationEmail(inv.token, inv.guest_email, action.name, inviteName) } catch {}
            onUpdate()
            getPendingInvitations(action.id).then(setPendingInvitations).catch(() => {})
        } catch (err) {
            setInviteError(err.message)
        } finally {
            setInviting(false)
        }
    }

    function copyLink() {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="members-tab">
            {isAdmin && action.status === 'SETUP' && (
                <div className="invite-section">
                    <form className="invite-form" onSubmit={handleInvite}>
                        <input
                            type="text"
                            value={inviteName}
                            onChange={e => setInviteName(e.target.value)}
                            placeholder={t('invite.name')}
                        />
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder={t('invite.email')}
                            required
                        />
                        <button type="submit" className="btn-primary" disabled={inviting}>
                            {inviting ? t('app.loading') : t('invite.submit')}
                        </button>
                    </form>
                    {inviteLink && (
                        <div className="invite-link-box">
                            <span className="success-msg">{t('invite.success')}</span>
                            <div className="invite-link-row">
                                <input readOnly value={inviteLink} className="invite-link-input" />
                                <button type="button" onClick={copyLink} className="btn-copy">
                                    {copied ? t('invite.linkCopied') : t('invite.copyLink')}
                                </button>
                            </div>
                        </div>
                    )}
                    {inviteError && <p className="error-msg">{inviteError}</p>}
                </div>
            )}

            <ul className="member-list">
                {memberships.map(m => (
                    <li key={m.id} className="member-item">
                        <div className="member-info">
                            <span className="member-name">
                                {m.is_guest ? m.guest_email : (m.display_name || '—')}
                            </span>
                            {m.user_id === currentUserId && (
                                <span className="member-you">({t('members.you')})</span>
                            )}
                        </div>
                        <span className={`role-badge role-${m.role_in_action.toLowerCase()}`}>
                            {t(`members.role.${m.role_in_action}`)}
                        </span>
                    </li>
                ))}
                {pendingInvitations.map(inv => (
                    <li key={inv.id} className="member-item">
                        <div className="member-info">
                            {inv.invited_name && (
                                <span className="member-name">{inv.invited_name}</span>
                            )}
                            <span className="member-email-muted">{inv.guest_email}</span>
                        </div>
                        <span className={`invite-tag ${inv.status === 'PENDING' ? 'tag-invited' : 'tag-rejected'}`}>
                            {inv.status === 'PENDING' ? t('invite.invited') : t('invite.rejected')}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ActionDetailPage
