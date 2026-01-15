export interface CustomModel {
  id: string;
  model: string;
  displayName: string;
  baseUrl: string;
  apiKey: string;
  provider: "anthropic" | "openai" | "generic-chat-completion-api";
  maxOutputTokens?: number;
}

export interface McpServer {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface ClaudeSettings {
  customModels?: CustomModel[];
  mcpServers?: Record<string, McpServer>;
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  env?: Record<string, string>;
}

export interface ClaudeProjectSettings {
  allowedTools?: string[];
  mcpServers?: Record<string, McpServer>;
}
