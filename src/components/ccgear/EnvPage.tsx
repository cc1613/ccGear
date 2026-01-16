import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/store/settings-store'

const ENV_PRESETS = [
  { name: 'ANTHROPIC_API_KEY', isSecret: true },
  { name: 'OPENAI_API_KEY', isSecret: true },
  { name: 'GITHUB_TOKEN', isSecret: true },
  { name: 'OPENROUTER_API_KEY', isSecret: true },
  { name: 'GEMINI_API_KEY', isSecret: true },
  { name: 'AZURE_OPENAI_API_KEY', isSecret: true },
  { name: 'AZURE_OPENAI_ENDPOINT', isSecret: false },
  { name: 'HTTP_PROXY', isSecret: false },
  { name: 'HTTPS_PROXY', isSecret: false },
  { name: 'NO_PROXY', isSecret: false },
]

export function EnvPage() {
  const { t } = useTranslation()
  const { settings, setEnvVariables } = useSettingsStore()
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})

  const envVars = settings.env || {}
  const entries = Object.entries(envVars)

  const addVariable = (name: string, value: string = '') => {
    if (!name.trim() || envVars[name.trim()]) return
    setEnvVariables({ ...envVars, [name.trim()]: value })
    setNewName('')
    setNewValue('')
  }

  const updateVariable = (name: string, value: string) => {
    setEnvVariables({ ...envVars, [name]: value })
  }

  const deleteVariable = (name: string) => {
    const newEnv = { ...envVars }
    delete newEnv[name]
    setEnvVariables(newEnv)
  }

  const toggleShowValue = (name: string) => {
    setShowValues((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const isSecretVar = (name: string) => {
    return (
      name.toLowerCase().includes('key') ||
      name.toLowerCase().includes('token') ||
      name.toLowerCase().includes('secret') ||
      name.toLowerCase().includes('password')
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{t('env.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('env.description')}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">{t('env.presets')}</p>
        <div className="flex flex-wrap gap-2">
          {ENV_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              disabled={envVars[preset.name] !== undefined}
              onClick={() => addVariable(preset.name)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder={t('env.variableName')}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder={t('env.variableValue')}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => addVariable(newName, newValue)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('env.addVariable')}
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>{t('env.noVariables')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(([name, value]) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-lg border bg-card p-3"
              >
                <div className="w-1/3 font-mono text-sm truncate">{name}</div>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type={isSecretVar(name) && !showValues[name] ? 'password' : 'text'}
                    value={value}
                    onChange={(e) => updateVariable(name, e.target.value)}
                    className="font-mono text-sm"
                  />
                  {isSecretVar(name) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleShowValue(name)}
                    >
                      {showValues[name] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteVariable(name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
