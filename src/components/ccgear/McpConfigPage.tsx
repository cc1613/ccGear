import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/store/settings-store'
import type { McpServer } from '@/types/settings'

const MCP_PRESETS: { name: string; server: McpServer }[] = [
  {
    name: 'filesystem',
    server: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/directory'],
    },
  },
  {
    name: 'github',
    server: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: '' },
    },
  },
  {
    name: 'postgres',
    server: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost/mydb'],
    },
  },
  {
    name: 'sqlite',
    server: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite', '/path/to/database.db'],
    },
  },
  {
    name: 'brave-search',
    server: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: { BRAVE_API_KEY: '' },
    },
  },
  {
    name: 'puppeteer',
    server: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    },
  },
  {
    name: 'memory',
    server: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
    },
  },
  {
    name: 'fetch',
    server: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch'],
    },
  },
]

interface ServerFormData {
  name: string
  command: string
  args: string
  env: string
}

export function McpConfigPage() {
  const { t } = useTranslation()
  const { settings, addMcpServer, updateMcpServer, deleteMcpServer } =
    useSettingsStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServerFormData>({
    name: '',
    command: '',
    args: '',
    env: '',
  })

  const servers = Object.entries(settings.mcpServers || {})

  const openAddDialog = () => {
    setEditingName(null)
    setFormData({ name: '', command: '', args: '', env: '' })
    setDialogOpen(true)
  }

  const openEditDialog = (name: string, server: McpServer) => {
    setEditingName(name)
    setFormData({
      name,
      command: server.command,
      args: server.args?.join('\n') || '',
      env: server.env ? JSON.stringify(server.env, null, 2) : '',
    })
    setDialogOpen(true)
  }

  const handlePresetClick = (preset: { name: string; server: McpServer }) => {
    if (settings.mcpServers?.[preset.name]) return
    addMcpServer(preset.name, preset.server)
  }

  const handleSave = () => {
    if (!formData.name || !formData.command) return

    const server: McpServer = {
      command: formData.command,
      args: formData.args
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean),
      env: formData.env ? JSON.parse(formData.env) : undefined,
    }

    if (editingName) {
      if (editingName !== formData.name) {
        deleteMcpServer(editingName)
      }
      updateMcpServer(formData.name, server)
    } else {
      addMcpServer(formData.name, server)
    }
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{t('mcp.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('mcp.description')}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">{t('mcp.presets')}</p>
        <div className="flex flex-wrap gap-2">
          {MCP_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              disabled={!!settings.mcpServers?.[preset.name]}
              onClick={() => handlePresetClick(preset)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {t('mcp.add')}
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {servers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>{t('mcp.noServers')}</p>
            <p className="text-sm">{t('mcp.noServersHint')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {servers.map(([name, server]) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-lg border bg-card p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {server.command} {server.args?.join(' ')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(name, server)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMcpServer(name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingName ? t('mcp.dialog.editTitle') : t('mcp.dialog.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('mcp.dialog.serverName')}</Label>
              <Input
                placeholder={t('mcp.dialog.serverNamePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('mcp.dialog.command')}</Label>
              <Input
                placeholder={t('mcp.dialog.commandPlaceholder')}
                value={formData.command}
                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('mcp.dialog.args')}</Label>
              <Textarea
                placeholder={t('mcp.dialog.argsPlaceholder')}
                value={formData.args}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, args: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('mcp.dialog.env')}</Label>
              <Textarea
                placeholder={t('mcp.dialog.envPlaceholder')}
                value={formData.env}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, env: e.target.value })}
                rows={3}
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
