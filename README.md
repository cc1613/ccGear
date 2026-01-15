# ccGear

BYOK Model Configuration for Claude Code - A desktop application for configuring Claude Code settings.

## Features

- **Custom Model Management** - Configure custom AI models with BYOK (Bring Your Own Key)
- **MCP Server Configuration** - Manage MCP (Model Context Protocol) servers
- **Permission Management** - Configure allowed/denied tools for Claude Code
- **Import/Export** - Backup and restore your configuration

## Configuration

ccGear reads and writes to `~/.claude/settings.json`:

```json
{
  "customModels": [
    {
      "model": "your-model-id",
      "displayName": "My Custom Model",
      "baseUrl": "https://api.provider.com/v1",
      "apiKey": "YOUR_API_KEY",
      "provider": "generic-chat-completion-api",
      "maxOutputTokens": 16384
    }
  ],
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  },
  "permissions": {
    "allow": ["Bash", "Read"],
    "deny": []
  }
}
```

## Development

### Prerequisites

- Node.js 20+
- Rust (latest stable)
- Platform-specific dependencies: https://tauri.app/start/prerequisites/

### Setup

```bash
npm install
npm run tauri:dev
```

### Build

```bash
npm run tauri:build
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Tauri v2, Rust
- **State Management**: Zustand

## License

MIT
