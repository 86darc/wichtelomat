import { useTranslation } from 'react-i18next'

function LoginPage() {
    const { t } = useTranslation()
    return <div><h1>{t('auth.login')}</h1></div>
}

export default LoginPage