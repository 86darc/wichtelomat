import { useTranslation } from 'react-i18next'
import { logout } from '../../services/authService'

function ActionsListPage() {
    const { t } = useTranslation()
    return (
        <div>
            <h1>{t('actions.myActions')}</h1>
            <button onClick={() => logout()}>{t('auth.logout')}</button>
        </div>
    )
}

export default ActionsListPage