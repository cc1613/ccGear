import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Cpu, Server, Shield, Variable, Info } from 'lucide-react'

export type FeatureType = 'models' | 'mcp' | 'permissions' | 'env' | 'about'

interface CcGearSidebarProps {
  activeFeature: FeatureType
  onFeatureChange: (feature: FeatureType) => void
}

const features: { id: FeatureType; icon: typeof Cpu }[] = [
  { id: 'models', icon: Cpu },
  { id: 'mcp', icon: Server },
  { id: 'permissions', icon: Shield },
  { id: 'env', icon: Variable },
  { id: 'about', icon: Info },
]

export function CcGearSidebar({
  activeFeature,
  onFeatureChange,
}: CcGearSidebarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full w-48 flex-col border-r bg-muted/30">
      <div className="flex-1 py-2">
        {features.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onFeatureChange(id)}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
              activeFeature === id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{t(`sidebar.${id}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
