import { create } from "zustand";
import type { CustomModel, McpServer, ClaudeSettings } from "@/types";

interface SettingsState {
  settings: ClaudeSettings;
  hasChanges: boolean;
  isLoading: boolean;
  error: string | null;
  setSettings: (settings: ClaudeSettings) => void;
  updateCustomModels: (models: CustomModel[]) => void;
  addCustomModel: (model: CustomModel) => void;
  updateCustomModel: (id: string, model: Partial<CustomModel>) => void;
  removeCustomModel: (id: string) => void;
  updateMcpServers: (servers: Record<string, McpServer>) => void;
  addMcpServer: (name: string, server: McpServer) => void;
  updateMcpServer: (name: string, server: McpServer) => void;
  removeMcpServer: (name: string) => void;
  setHasChanges: (hasChanges: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialSettings: ClaudeSettings = {
  customModels: [],
  mcpServers: {},
  permissions: {
    allow: [],
    deny: [],
  },
  env: {},
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: initialSettings,
  hasChanges: false,
  isLoading: false,
  error: null,

  setSettings: (settings) =>
    set({ settings, hasChanges: false, error: null }),

  updateCustomModels: (models) =>
    set((state) => ({
      settings: { ...state.settings, customModels: models },
      hasChanges: true,
    })),

  addCustomModel: (model) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customModels: [...(state.settings.customModels || []), model],
      },
      hasChanges: true,
    })),

  updateCustomModel: (id, updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customModels: (state.settings.customModels || []).map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      },
      hasChanges: true,
    })),

  removeCustomModel: (id) =>
    set((state) => ({
      settings: {
        ...state.settings,
        customModels: (state.settings.customModels || []).filter(
          (m) => m.id !== id
        ),
      },
      hasChanges: true,
    })),

  updateMcpServers: (servers) =>
    set((state) => ({
      settings: { ...state.settings, mcpServers: servers },
      hasChanges: true,
    })),

  addMcpServer: (name, server) =>
    set((state) => ({
      settings: {
        ...state.settings,
        mcpServers: { ...state.settings.mcpServers, [name]: server },
      },
      hasChanges: true,
    })),

  updateMcpServer: (name, server) =>
    set((state) => ({
      settings: {
        ...state.settings,
        mcpServers: { ...state.settings.mcpServers, [name]: server },
      },
      hasChanges: true,
    })),

  removeMcpServer: (name) =>
    set((state) => {
      const { [name]: _, ...rest } = state.settings.mcpServers || {};
      return {
        settings: { ...state.settings, mcpServers: rest },
        hasChanges: true,
      };
    }),

  setHasChanges: (hasChanges) => set({ hasChanges }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ settings: initialSettings, hasChanges: false, error: null }),
}));
