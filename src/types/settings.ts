export interface CustomModel {
  id: string
  title: string
  modelId: string
  provider: string
  apiKeyEnvVar?: string
  maxTokens?: number
  baseUrl?: string
}

export interface McpServer {
  command: string
  args?: string[]
  env?: Record<string, string>
}

export interface ClaudeSettings {
  customModels?: CustomModel[]
  mcpServers?: Record<string, McpServer>
  permissions?: {
    allow?: string[]
    deny?: string[]
  }
  env?: Record<string, string>
}
