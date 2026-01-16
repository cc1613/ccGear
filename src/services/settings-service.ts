import { homeDir, join } from '@tauri-apps/api/path'
import {
  readTextFile,
  writeTextFile,
  exists,
  mkdir,
} from '@tauri-apps/plugin-fs'
import type { ClaudeSettings } from '@/types/settings'

const SETTINGS_FILE = 'settings.json'
const CLAUDE_DIR = '.claude'

async function getSettingsPath(): Promise<string> {
  const home = await homeDir()
  return await join(home, CLAUDE_DIR, SETTINGS_FILE)
}

async function ensureClaudeDir(): Promise<void> {
  const home = await homeDir()
  const claudeDir = await join(home, CLAUDE_DIR)
  if (!(await exists(claudeDir))) {
    await mkdir(claudeDir, { recursive: true })
  }
}

export async function loadSettings(): Promise<ClaudeSettings> {
  try {
    const path = await getSettingsPath()
    if (!(await exists(path))) {
      return {
        customModels: [],
        mcpServers: {},
        permissions: { allow: [], deny: [] },
        env: {},
      }
    }
    const content = await readTextFile(path)
    const parsed = JSON.parse(content)
    return {
      customModels: parsed.customModels || [],
      mcpServers: parsed.mcpServers || {},
      permissions: parsed.permissions || { allow: [], deny: [] },
      env: parsed.env || {},
    }
  } catch (error) {
    console.error('Failed to load settings', error)
    return {
      customModels: [],
      mcpServers: {},
      permissions: { allow: [], deny: [] },
      env: {},
    }
  }
}

export async function saveSettings(settings: ClaudeSettings): Promise<void> {
  try {
    await ensureClaudeDir()
    const path = await getSettingsPath()

    let existingContent: Record<string, unknown> = {}
    if (await exists(path)) {
      try {
        const content = await readTextFile(path)
        existingContent = JSON.parse(content)
      } catch {
        // File exists but is invalid JSON, start fresh
      }
    }

    const merged = {
      ...existingContent,
      customModels: settings.customModels,
      mcpServers: settings.mcpServers,
      permissions: settings.permissions,
      env: settings.env,
    }

    await writeTextFile(path, JSON.stringify(merged, null, 2))
    console.log('Settings saved successfully')
  } catch (error) {
    console.error('Failed to save settings', error)
    throw error
  }
}
