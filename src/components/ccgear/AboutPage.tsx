import { useTranslation } from 'react-i18next'
import { Cpu, Server, Shield, Variable, Github } from 'lucide-react'

export function AboutPage() {
  const { t } = useTranslation()

  const features = [
    { icon: Cpu, key: 'models' },
    { icon: Server, key: 'mcp' },
    { icon: Shield, key: 'permissions' },
    { icon: Variable, key: 'env' },
  ]

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t('about.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('about.version')}: 0.1.0
        </p>
      </div>

      <p className="text-muted-foreground mb-6">{t('about.description')}</p>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">{t('about.features')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-sm">{t(`about.feature.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com/cc1613/ccGear"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            {t('about.github')}
          </a>
          <span>|</span>
          <span>{t('about.license')}: MIT</span>
        </div>
      </div>
    </div>
  )
}
