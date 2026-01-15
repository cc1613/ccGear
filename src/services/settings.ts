import {
  readTextFile,
  writeTextFile,
  exists,
  mkdir,
} from "@tauri-apps/plugin-fs";
import { homeDir, join } from "@tauri-apps/api/path";
import type { ClaudeSettings } from "@/types";

const SETTINGS_FILE = "settings.json";
const CLAUDE_DIR = ".claude";

export async function getClaudeSettingsPath(): Promise<string> {
  const home = await homeDir();
  return await join(home, CLAUDE_DIR, SETTINGS_FILE);
}

export async function getClaudeDir(): Promise<string> {
  const home = await homeDir();
  return await join(home, CLAUDE_DIR);
}

export async function ensureClaudeDir(): Promise<void> {
  const claudeDir = await getClaudeDir();
  const dirExists = await exists(claudeDir);
  if (!dirExists) {
    await mkdir(claudeDir, { recursive: true });
  }
}

export async function loadSettings(): Promise<ClaudeSettings> {
  try {
    const settingsPath = await getClaudeSettingsPath();
    const fileExists = await exists(settingsPath);

    if (!fileExists) {
      return {
        customModels: [],
        mcpServers: {},
        permissions: { allow: [], deny: [] },
        env: {},
      };
    }

    const content = await readTextFile(settingsPath);
    return JSON.parse(content) as ClaudeSettings;
  } catch (error) {
    console.error("Failed to load settings:", error);
    throw error;
  }
}

export async function saveSettings(settings: ClaudeSettings): Promise<void> {
  try {
    await ensureClaudeDir();
    const settingsPath = await getClaudeSettingsPath();
    const content = JSON.stringify(settings, null, 2);
    await writeTextFile(settingsPath, content);
  } catch (error) {
    console.error("Failed to save settings:", error);
    throw error;
  }
}

export async function backupSettings(): Promise<string> {
  const settings = await loadSettings();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = await join(
    await getClaudeDir(),
    `settings.backup.${timestamp}.json`
  );
  await writeTextFile(backupPath, JSON.stringify(settings, null, 2));
  return backupPath;
}
