import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettingsStore } from "@/store/settings";

export function PermissionsManager() {
  const { settings, setSettings } = useSettingsStore();
  const [newAllowTool, setNewAllowTool] = useState("");
  const [newDenyTool, setNewDenyTool] = useState("");

  const permissions = settings.permissions || { allow: [], deny: [] };
  const allowList = permissions.allow || [];
  const denyList = permissions.deny || [];

  const handleAddAllow = () => {
    if (!newAllowTool.trim()) return;
    const updated = {
      ...settings,
      permissions: {
        ...permissions,
        allow: [...allowList, newAllowTool.trim()],
      },
    };
    setSettings(updated);
    setNewAllowTool("");
  };

  const handleRemoveAllow = (tool: string) => {
    const updated = {
      ...settings,
      permissions: {
        ...permissions,
        allow: allowList.filter((t) => t !== tool),
      },
    };
    setSettings(updated);
  };

  const handleAddDeny = () => {
    if (!newDenyTool.trim()) return;
    const updated = {
      ...settings,
      permissions: {
        ...permissions,
        deny: [...denyList, newDenyTool.trim()],
      },
    };
    setSettings(updated);
    setNewDenyTool("");
  };

  const handleRemoveDeny = (tool: string) => {
    const updated = {
      ...settings,
      permissions: {
        ...permissions,
        deny: denyList.filter((t) => t !== tool),
      },
    };
    setSettings(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Permissions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure which tools Claude Code is allowed or denied to use.
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-6 pr-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-green-600">
                Allowed Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newAllowTool}
                  onChange={(e) => setNewAllowTool(e.target.value)}
                  placeholder="Tool name (e.g., Bash, Read)"
                  onKeyDown={(e) => e.key === "Enter" && handleAddAllow()}
                />
                <Button onClick={handleAddAllow} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {allowList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tools explicitly allowed.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allowList.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-md text-sm"
                    >
                      {tool}
                      <button
                        onClick={() => handleRemoveAllow(tool)}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-red-600">
                Denied Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newDenyTool}
                  onChange={(e) => setNewDenyTool(e.target.value)}
                  placeholder="Tool name (e.g., Bash, Write)"
                  onKeyDown={(e) => e.key === "Enter" && handleAddDeny()}
                />
                <Button onClick={handleAddDeny} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {denyList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tools explicitly denied.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {denyList.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-md text-sm"
                    >
                      {tool}
                      <button
                        onClick={() => handleRemoveDeny(tool)}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
