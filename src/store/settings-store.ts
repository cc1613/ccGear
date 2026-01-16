import { create } from 'zustand'
import type { ClaudeSettings, CustomModel, McpServer } from '@/types/settings'

interface SettingsState {
  settings: ClaudeSettings
  hasChanges: boolean
  setSettings: (settings: ClaudeSettings) => void
  addModel: (model: CustomModel) => void
  updateModel: (id: string, model: CustomModel) => void
  deleteModel: (id: string) => void
  reorderModels: (models: CustomModel[]) => void
  addMcpServer: (name: string, server: McpServer) => void
  updateMcpServer: (name: string, server: McpServer) => void
  deleteMcpServer: (name: string) => void
  setAllowedTools: (tools: string[]) => void
  setDeniedTools: (tools: string[]) => void
  setEnvVariables: (env: Record<string, string>) => void
  markSaved: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    customModels: [],
    mcpServers: {},
    permissions: { allow: [], deny: [] },
    env: {},
  },
  hasChanges: false,

  setSettings: (settings) => set({ settings, hasChanges: false }),

  addModel: (model) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customModels: [...(state.settings.customModels || []), model],
      },
      hasChanges: true,
    })),

  updateModel: (id, model) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customModels: (state.settings.customModels || []).map((m) =>
          m.id === id ? model : m
        ),
      },
      hasChanges: true,
    })),

  deleteModel: (id) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customModels: (state.settings.customModels || []).filter(
          (m) => m.id !== id
        ),
      },
      hasChanges: true,
    })),

  reorderModels: (models) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customModels: models,
      },
      hasChanges: true,
    })),

  addMcpServer: (name, server) =>
    set((state) => ({
      settings: {
        ...state.settings,
        mcpServers: {
          ...(state.settings.mcpServers || {}),
          [name]: server,
        },
      },
      hasChanges: true,
    })),

  updateMcpServer: (name, server) =>
    set((state) => ({
      settings: {
        ...state.settings,
        mcpServers: {
          ...(state.settings.mcpServers || {}),
          [name]: server,
        },
      },
      hasChanges: true,
    })),

  deleteMcpServer: (name) =>
    set((state) => {
      const newServers = { ...(state.settings.mcpServers || {}) }
      delete newServers[name]
      return {
        settings: {
          ...state.settings,
          mcpServers: newServers,
        },
        hasChanges: true,
      }
    }),

  setAllowedTools: (tools) =>
    set((state) => ({
      settings: {
        ...state.settings,
        permissions: {
          ...(state.settings.permissions || {}),
          allow: tools,
        },
      },
      hasChanges: true,
    })),

  setDeniedTools: (tools) =>
    set((state) => ({
      settings: {
        ...state.settings,
        permissions: {
          ...(state.settings.permissions || {}),
          deny: tools,
        },
      },
      hasChanges: true,
    })),

  setEnvVariables: (env) =>
    set((state) => ({
      settings: {
        ...state.settings,
        env,
      },
      hasChanges: true,
    })),

  markSaved: () => set({ hasChanges: false }),
}))
