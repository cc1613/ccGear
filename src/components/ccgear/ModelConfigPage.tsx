import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  GripVertical,
  Pencil,
  Trash2,
  Copy,
  RefreshCw,
  FileText,
  Download,
  Upload,
  CheckSquare,
  X,
  Star,
} from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
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
  onCopy: (model: CustomModel) => void
  onSetDefault: (id: string) => void
  isDefault: boolean
  selectionMode: boolean
  isSelected: boolean
  onSelect: (id: string, selected: boolean) => void
}

function SortableModelCard({
  model,
  onEdit,
  onDelete,
  onCopy,
  onSetDefault,
  isDefault,
  selectionMode,
  isSelected,
  onSelect,
}: SortableModelCardProps) {
  const { t } = useTranslation()
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
      className={`flex items-center gap-2 rounded-lg border bg-card p-3 ${
        isDefault ? 'border-primary' : ''
      } ${isSelected ? 'bg-accent' : ''}`}
    >
      {selectionMode ? (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(model.id, checked === true)}
        />
      ) : (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{model.title}</span>
          {isDefault && (
            <Badge variant="default" className="text-xs">
              {t('models.default')}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {model.provider} / {model.modelId}
        </div>
      </div>
      {!selectionMode && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSetDefault(model.id)}
            title={t('models.setDefault')}
            className={isDefault ? 'text-primary' : ''}
          >
            <Star className={`h-4 w-4 ${isDefault ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCopy(model)}
            title={t('models.copy')}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(model)}
            title={t('common.edit')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(model.id)}
            title={t('common.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}

export function ModelConfigPage() {
  const { t } = useTranslation()
  const {
    settings,
    hasChanges,
    addModel,
    updateModel,
    deleteModel,
    reorderModels,
  } = useSettingsStore()
  const [search, setSearch] = useState('')
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<CustomModel | null>(null)
  const [copyingModel, setCopyingModel] = useState<CustomModel | null>(null)
  const [formData, setFormData] = useState<Partial<CustomModel>>({})
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false)
  const [defaultModelId, setDefaultModelId] = useState<string | null>(null)

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)

  const configPath = '~/.claude/settings.json'

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const models = settings.customModels || []

  // Get unique providers for filter
  const providers = [...new Set(models.map((m) => m.provider))].filter(Boolean)

  // Filter models by search and provider
  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.modelId.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase())
    const matchesProvider =
      filterProvider === 'all' || m.provider === filterProvider
    return matchesSearch && matchesProvider
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = models.findIndex((m) => m.id === active.id)
      const newIndex = models.findIndex((m) => m.id === over.id)
      reorderModels(arrayMove(models, oldIndex, newIndex))
    }
  }

  const handleRefresh = () => {
    if (hasChanges) {
      setShowRefreshConfirm(true)
    } else {
      // Reload settings from file (would need service call)
      window.location.reload()
    }
  }

  const handleConfirmRefresh = () => {
    setShowRefreshConfirm(false)
    window.location.reload()
  }

  const openAddDialog = () => {
    setEditingModel(null)
    setCopyingModel(null)
    setFormData({})
    setDialogOpen(true)
  }

  const openEditDialog = (model: CustomModel) => {
    setEditingModel(model)
    setCopyingModel(null)
    setFormData(model)
    setDialogOpen(true)
  }

  const openCopyDialog = (model: CustomModel) => {
    setEditingModel(null)
    setCopyingModel(model)
    setFormData({
      ...model,
      id: crypto.randomUUID(),
      title: `${model.title} (Copy)`,
    })
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

  const getDialogTitle = () => {
    if (editingModel) return t('models.dialog.editTitle')
    if (copyingModel) return t('models.dialog.copyTitle')
    return t('models.dialog.addTitle')
  }

  // Set default model
  const handleSetDefault = (id: string) => {
    setDefaultModelId(id === defaultModelId ? null : id)
    toast.success(t('models.defaultSet'))
  }

  // Selection mode handlers
  const handleEnterSelectionMode = () => {
    setSelectionMode(true)
    setSelectedIds(new Set())
  }

  const handleExitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredModels.map((m) => m.id)))
  }

  const handleBatchDelete = () => {
    selectedIds.forEach((id) => deleteModel(id))
    setShowBatchDeleteConfirm(false)
    handleExitSelectionMode()
    toast.success(t('models.batchDeleted', { count: selectedIds.size }))
  }

  // Export models to JSON
  const handleExport = () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      models: models,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ccgear-models-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('models.exported'))
  }

  // Import models from JSON
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (!data.models || !Array.isArray(data.models)) {
          toast.error(t('models.importError'))
          return
        }

        let importedCount = 0
        data.models.forEach((model: CustomModel) => {
          if (model.modelId && model.provider) {
            const exists = models.some((m) => m.modelId === model.modelId)
            if (!exists) {
              addModel({
                ...model,
                id: crypto.randomUUID(),
              })
              importedCount++
            }
          }
        })

        toast.success(t('models.imported', { count: importedCount }))
      } catch {
        toast.error(t('models.importError'))
      }
    }
    input.click()
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header with config path */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('models.title')}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleImport}
              title={t('models.import')}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              disabled={models.length === 0}
              title={t('models.export')}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title={t('models.refresh')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{configPath}</span>
          {hasChanges && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex-shrink-0"
            >
              {t('models.unsavedChanges')}
            </Badge>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">
          {t('models.presets')}
        </p>
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

      {/* Search and filter bar */}
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
        <Select value={filterProvider} onValueChange={setFilterProvider}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('models.filterProvider')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('models.allProviders')}</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectionMode ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnterSelectionMode}
              disabled={models.length === 0}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {t('models.batchDelete')}
            </Button>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {t('models.add')}
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {t('models.selectAll')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBatchDeleteConfirm(true)}
              disabled={selectedIds.size === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('models.deleteSelected', { count: selectedIds.size })}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExitSelectionMode}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
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
                    onCopy={openCopyDialog}
                    onSetDefault={handleSetDefault}
                    isDefault={model.id === defaultModelId}
                    selectionMode={selectionMode}
                    isSelected={selectedIds.has(model.id)}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add/Edit/Copy Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('models.dialog.modelTitle')}</Label>
              <Input
                placeholder={t('models.dialog.modelTitlePlaceholder')}
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.modelId')}</Label>
              <Input
                placeholder={t('models.dialog.modelIdPlaceholder')}
                value={formData.modelId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, modelId: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.provider')}</Label>
              <Input
                placeholder={t('models.dialog.providerPlaceholder')}
                value={formData.provider || ''}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.apiKeyEnvVar')}</Label>
              <Input
                placeholder={t('models.dialog.apiKeyEnvVarPlaceholder')}
                value={formData.apiKeyEnvVar || ''}
                onChange={(e) =>
                  setFormData({ ...formData, apiKeyEnvVar: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.maxTokens')}</Label>
              <Input
                type="number"
                value={formData.maxTokens || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxTokens: parseInt(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('models.dialog.baseUrl')}</Label>
              <Input
                placeholder={t('models.dialog.baseUrlPlaceholder')}
                value={formData.baseUrl || ''}
                onChange={(e) =>
                  setFormData({ ...formData, baseUrl: e.target.value })
                }
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

      {/* Refresh Confirmation Dialog */}
      <AlertDialog open={showRefreshConfirm} onOpenChange={setShowRefreshConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('models.refreshConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('models.refreshConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRefresh}>
              {t('models.refreshConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Delete Confirmation Dialog */}
      <AlertDialog
        open={showBatchDeleteConfirm}
        onOpenChange={setShowBatchDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('models.batchDeleteConfirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('models.batchDeleteConfirm.description', {
                count: selectedIds.size,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
