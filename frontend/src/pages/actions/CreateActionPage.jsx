import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createAction } from '../../services/actionsService'

function CreateActionPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [handoverDate, setHandoverDate] = useState('')
    const [maxCost, setMaxCost] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const action = await createAction(
                name,
                handoverDate,
                maxCost ? parseFloat(maxCost) : null
            )
            navigate(`/actions/${action.id}`)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-container">
            <h1>{t('actions.create')}</h1>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleSubmit} className="form-vertical">
                <label>
                    {t('actions.name')}
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    {t('actions.handoverDate')}
                    <input
                        type="date"
                        value={handoverDate}
                        onChange={e => setHandoverDate(e.target.value)}
                        required
                    />
                </label>
                <label>
                    {t('actions.maxCost')}
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={maxCost}
                        onChange={e => setMaxCost(e.target.value)}
                    />
                </label>

                <div className="page-footer">
                    <div className="page-footer-left">
                        <Link to="/" className="btn-secondary">← {t('actions.backToList')}</Link>
                    </div>
                    <div className="page-footer-right">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? t('app.loading') : t('actions.create')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CreateActionPage
