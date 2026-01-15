import { useState } from "react";
import { Plus, Trash2, Edit2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/store/settings";
import type { McpServer } from "@/types";

interface McpFormData {
  name: string;
  command: string;
  args: string;
  env: string;
}

const defaultFormData: McpFormData = {
  name: "",
  command: "",
  args: "",
  env: "",
};

export function McpManager() {
  const { settings, addMcpServer, updateMcpServer, removeMcpServer } =
    useSettingsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [formData, setFormData] = useState<McpFormData>(defaultFormData);

  const servers = settings.mcpServers || {};
  const serverEntries = Object.entries(servers);

  const handleAdd = () => {
    setEditingName(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleEdit = (name: string, server: McpServer) => {
    setEditingName(name);
    setFormData({
      name,
      command: server.command,
      args: server.args?.join(" ") || "",
      env: server.env ? JSON.stringify(server.env, null, 2) : "",
    });
    setIsDialogOpen(true);
  };

  const handleCopy = (name: string, server: McpServer) => {
    const newName = `${name}-copy`;
    addMcpServer(newName, { ...server });
  };

  const handleDelete = (name: string) => {
    removeMcpServer(name);
  };

  const handleSave = () => {
    if (!formData.name || !formData.command) {
      return;
    }

    const server: McpServer = {
      command: formData.command,
    };

    if (formData.args.trim()) {
      server.args = formData.args.split(/\s+/).filter(Boolean);
    }

    if (formData.env.trim()) {
      try {
        server.env = JSON.parse(formData.env);
      } catch {
        // Invalid JSON, ignore env
      }
    }

    if (editingName && editingName !== formData.name) {
      removeMcpServer(editingName);
    }

    if (editingName) {
      updateMcpServer(formData.name, server);
    } else {
      addMcpServer(formData.name, server);
    }

    setIsDialogOpen(false);
    setEditingName(null);
    setFormData(defaultFormData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">MCP Servers</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Server
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-3 pr-4">
          {serverEntries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No MCP servers configured. Click "Add Server" to get started.
              </CardContent>
            </Card>
          ) : (
            serverEntries.map(([name, server]) => (
              <Card key={name}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(name, server)}
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(name, server)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(name)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2 text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div className="truncate">
                      <span className="font-medium">Command:</span>{" "}
                      {server.command}
                    </div>
                    {server.args && server.args.length > 0 && (
                      <div className="truncate">
                        <span className="font-medium">Args:</span>{" "}
                        {server.args.join(" ")}
                      </div>
                    )}
                    {server.env && Object.keys(server.env).length > 0 && (
                      <div className="truncate">
                        <span className="font-medium">Env:</span>{" "}
                        {Object.keys(server.env).join(", ")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingName ? "Edit MCP Server" : "Add MCP Server"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="my-mcp-server"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="command">Command</Label>
              <Input
                id="command"
                value={formData.command}
                onChange={(e) =>
                  setFormData({ ...formData, command: e.target.value })
                }
                placeholder="npx, node, python, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="args">Arguments (space-separated)</Label>
              <Input
                id="args"
                value={formData.args}
                onChange={(e) =>
                  setFormData({ ...formData, args: e.target.value })
                }
                placeholder="-y @modelcontextprotocol/server-filesystem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="env">Environment Variables (JSON)</Label>
              <textarea
                id="env"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.env}
                onChange={(e) =>
                  setFormData({ ...formData, env: e.target.value })
                }
                placeholder='{"KEY": "value"}'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
