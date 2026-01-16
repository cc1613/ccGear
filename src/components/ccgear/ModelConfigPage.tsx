import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, GripVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/store/settings-store'
import type { CustomModel } from '@/types/settings'

const MODEL_PRESETS: Partial<CustomModel>[] = [
  {
    title: 'GPT-4 Turbo',
    modelId: 'gpt-4-turbo',
    provider: 'openai',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    maxTokens: 128000,
  },
  {
    title: 'GPT-4o',
    modelId: 'gpt-4o',
    provider: 'openai',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    maxTokens: 128000,
  },
  {
    title: 'Claude 3.5 Sonnet',
    modelId: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    maxTokens: 200000,
  },
  {
    title: 'Gemini 1.5 Pro',
    modelId: 'gemini-1.5-pro',
    provider: 'google',
    apiKeyEnvVar: 'GEMINI_API_KEY',
    maxTokens: 1000000,
  },
  {
    title: 'DeepSeek Chat',
    modelId: 'deepseek-chat',
    provider: 'deepseek',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    maxTokens: 64000,
    baseUrl: 'https://api.deepseek.com/v1',
  },
]

interface SortableModelCardProps {
  model: CustomModel
  onEdit: (model: CustomModel) => void
  onDelete: (id: string) => void
}

function SortableModelCard({ model, onEdit, onDelete }: SortableModelCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: model.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border bg-card p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{model.title}</div>
        <div className="text-xs text-muted-foreground truncate">
          {model.provider} / {model.modelId}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onEdit(model)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(model.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ModelConfigPage() {
  const { t } = useTranslation()
  const { settings, addModel, updateModel, deleteModel, reorderModels } =
    useSettingsStore()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<CustomModel | null>(null)
  const [formData, setFormData] = useState<Partial<CustomModel>>({})

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const models = settings.customModels || []
  const filteredModels = models.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.modelId.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase())
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = models.findIndex((m) => m.id === active.id)
      const newIndex = models.findIndex((m) => m.id === over.id)
      reorderModels(arrayMove(models, oldIndex, newIndex))
    }
  }

  const openAddDialog = () => {
    setEditingModel(null)
    setFormData({})
    setDialogOpen(true)
  }

  const openEditDialog = (model: CustomModel) => {
    setEditingModel(model)
    setFormData(model)
    setDialogOpen(true)
  }

  const handlePresetClick = (preset: Partial<CustomModel>) => {
    if (models.some((m) => m.modelId === preset.modelId)) return
    const newModel: CustomModel = {
      id: crypto.randomUUID(),
      title: preset.title || '',
      modelId: preset.modelId || '',
      provider: preset.provider || '',
      apiKeyEnvVar: preset.apiKeyEnvVar,
      maxTokens: preset.maxTokens,
      baseUrl: preset.baseUrl,
    }
    addModel(newModel)
  }

  const handleSave = () => {
    if (!formData.title || !formData.modelId || !formData.provider) return

    if (editingModel) {
      updateModel(editingModel.id, {
        ...editingModel,
        ...formData,
      } as CustomModel)
    } else {
      addModel({
        id: crypto.randomUUID(),
        ...formData,
      } as CustomModel)
    }
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{t('models.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('models.description')}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">{t('models.presets')}</p>
        <div className="flex flex-wrap gap-2">
          {MODEL_PRESETS.map((preset) => (
            <Button
              key={preset.modelId}
              variant="outline"
              size="sm"
              disabled={models.some((m) => m.modelId === preset.modelId)}
              onClick={() => handlePresetClick(preset)}
            >
              {preset.title}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('models.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {t('models.add')}
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredModels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>{t('models.noModels')}</p>
            <p className="text-sm">{t('models.noModelsHint')}</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredModels.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredModels.map((model) => (
                  <SortableModelCard
                    key={model.id}
                    model={model}
                    onEdit={openEditDialog}
                    onDelete={deleteModel}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModel ? t('models.dialog.editTitle') : t('models.dialog.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('models.dialog.modelTitle')}</Label>
              <Input
                placeholder={t('models.dialog.modelTitlePlaceholder')}
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.modelId')}</Label>
              <Input
                placeholder={t('models.dialog.modelIdPlaceholder')}
                value={formData.modelId || ''}
                onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.provider')}</Label>
              <Input
                placeholder={t('models.dialog.providerPlaceholder')}
                value={formData.provider || ''}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.apiKeyEnvVar')}</Label>
              <Input
                placeholder={t('models.dialog.apiKeyEnvVarPlaceholder')}
                value={formData.apiKeyEnvVar || ''}
                onChange={(e) => setFormData({ ...formData, apiKeyEnvVar: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.maxTokens')}</Label>
              <Input
                type="number"
                value={formData.maxTokens || ''}
                onChange={(e) =>
                  setFormData({ ...formData, maxTokens: parseInt(e.target.value) || undefined })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.baseUrl')}</Label>
              <Input
                placeholder={t('models.dialog.baseUrlPlaceholder')}
                value={formData.baseUrl || ''}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
