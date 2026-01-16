import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Moon, Sun, Languages } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CcGearSidebar, type FeatureType } from './CcGearSidebar'
import { ModelConfigPage } from './ModelConfigPage'
import { McpConfigPage } from './McpConfigPage'
import { PermissionsPage } from './PermissionsPage'
import { EnvPage } from './EnvPage'
import { AboutPage } from './AboutPage'
import { useSettingsStore } from '@/store/settings-store'
import { loadSettings, saveSettings } from '@/services/settings-service'
import { useTheme } from '@/hooks/use-theme'
import i18n from '@/i18n/config'

export function CcGearLayout() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { settings, hasChanges, setSettings, markSaved } = useSettingsStore()
  const [activeFeature, setActiveFeature] = useState<FeatureType>('models')
  const [pendingFeature, setPendingFeature] = useState<FeatureType | null>(null)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  useEffect(() => {
    loadSettings().then(setSettings)
  }, [setSettings])

  const handleFeatureChange = (feature: FeatureType) => {
    if (hasChanges && feature !== activeFeature) {
      setPendingFeature(feature)
      setShowUnsavedDialog(true)
    } else {
      setActiveFeature(feature)
    }
  }

  const handleSave = async () => {
    try {
      await saveSettings(settings)
      markSaved()
      toast.success(t('toast.success.preferencesSaved'))
    } catch {
      toast.error(t('toast.error.generic'))
    }
  }

  const handleDiscardChanges = () => {
    loadSettings().then(setSettings)
    if (pendingFeature) {
      setActiveFeature(pendingFeature)
      setPendingFeature(null)
    }
    setShowUnsavedDialog(false)
  }

  const handleSaveAndContinue = async () => {
    await handleSave()
    if (pendingFeature) {
      setActiveFeature(pendingFeature)
      setPendingFeature(null)
    }
    setShowUnsavedDialog(false)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const renderContent = () => {
    switch (activeFeature) {
      case 'models':
        return <ModelConfigPage />
      case 'mcp':
        return <McpConfigPage />
      case 'permissions':
        return <PermissionsPage />
      case 'env':
        return <EnvPage />
      case 'about':
        return <AboutPage />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2" data-tauri-drag-region>
        <div className="flex items-center gap-2">
          <span className="font-semibold">ccGear</span>
          {hasChanges && (
            <span className="text-xs text-muted-foreground">(unsaved)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('zh')}>
                中文
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            {t('common.save')}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CcGearSidebar
          activeFeature={activeFeature}
          onFeatureChange={handleFeatureChange}
        />
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before
              continuing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>
              Discard
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndContinue}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
