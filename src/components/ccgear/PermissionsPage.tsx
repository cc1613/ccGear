import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/store/settings-store'

const TOOL_PRESETS = [
  'Bash',
  'Read',
  'Write',
  'Edit',
  'MultiEdit',
  'Glob',
  'Grep',
  'LS',
  'TodoRead',
  'TodoWrite',
  'WebFetch',
  'WebSearch',
  'mcp__*',
]

export function PermissionsPage() {
  const { t } = useTranslation()
  const { settings, setAllowedTools, setDeniedTools } = useSettingsStore()
  const [allowInput, setAllowInput] = useState('')
  const [denyInput, setDenyInput] = useState('')

  const allowedTools = settings.permissions?.allow || []
  const deniedTools = settings.permissions?.deny || []

  const addAllowedTool = (tool: string) => {
    if (!tool.trim() || allowedTools.includes(tool.trim())) return
    setAllowedTools([...allowedTools, tool.trim()])
    setAllowInput('')
  }

  const removeAllowedTool = (tool: string) => {
    setAllowedTools(allowedTools.filter((t) => t !== tool))
  }

  const addDeniedTool = (tool: string) => {
    if (!tool.trim() || deniedTools.includes(tool.trim())) return
    setDeniedTools([...deniedTools, tool.trim()])
    setDenyInput('')
  }

  const removeDeniedTool = (tool: string) => {
    setDeniedTools(deniedTools.filter((t) => t !== tool))
  }

  const handlePresetClick = (tool: string, type: 'allow' | 'deny') => {
    if (type === 'allow') {
      if (!allowedTools.includes(tool)) {
        setAllowedTools([...allowedTools, tool])
      }
    } else {
      if (!deniedTools.includes(tool)) {
        setDeniedTools([...deniedTools, tool])
      }
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{t('permissions.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('permissions.description')}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-2">
          {t('permissions.presets')}
        </p>
        <div className="flex flex-wrap gap-2">
          {TOOL_PRESETS.map((tool) => (
            <Button
              key={tool}
              variant="outline"
              size="sm"
              disabled={allowedTools.includes(tool) || deniedTools.includes(tool)}
              onClick={() => handlePresetClick(tool, 'allow')}
            >
              {tool}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
        <div className="flex flex-col">
          <h3 className="font-medium mb-2">{t('permissions.allowedTools')}</h3>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder={t('permissions.toolPlaceholder')}
              value={allowInput}
              onChange={(e) => setAllowInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAllowedTool(allowInput)}
            />
            <Button size="icon" onClick={() => addAllowedTool(allowInput)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto border rounded-lg p-2">
            {allowedTools.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('permissions.noAllowedTools')}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allowedTools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm text-green-800 dark:text-green-200"
                  >
                    {tool}
                    <button
                      onClick={() => removeAllowedTool(tool)}
                      className="hover:text-green-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="font-medium mb-2">{t('permissions.deniedTools')}</h3>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder={t('permissions.toolPlaceholder')}
              value={denyInput}
              onChange={(e) => setDenyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDeniedTool(denyInput)}
            />
            <Button size="icon" onClick={() => addDeniedTool(denyInput)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto border rounded-lg p-2">
            {deniedTools.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('permissions.noDeniedTools')}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {deniedTools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-sm text-red-800 dark:text-red-200"
                  >
                    {tool}
                    <button
                      onClick={() => removeDeniedTool(tool)}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
