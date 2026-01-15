import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ModelManager } from "@/components/ModelManager";
import { McpManager } from "@/components/McpManager";
import { PermissionsManager } from "@/components/PermissionsManager";
import { useSettingsStore } from "@/store/settings";
import { loadSettings, saveSettings } from "@/services/settings";
import { Toaster, toast } from "sonner";
import { Save, RefreshCw, Settings, Server, Shield, Info } from "lucide-react";

function App() {
  const {
    settings,
    hasChanges,
    isLoading,
    setSettings,
    setHasChanges,
    setIsLoading,
    setError,
  } = useSettingsStore();
  const [activeTab, setActiveTab] = useState("models");

  useEffect(() => {
    loadSettingsFromFile();
  }, []);

  const loadSettingsFromFile = async () => {
    setIsLoading(true);
    try {
      const loaded = await loadSettings();
      setSettings(loaded);
      toast.success("Settings loaded");
    } catch (error) {
      console.error("Failed to load settings:", error);
      setError("Failed to load settings");
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveSettings(settings);
      setHasChanges(false);
      toast.success("Settings saved");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to reload?"
      );
      if (!confirmed) return;
    }
    await loadSettingsFromFile();
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">ccGear</h1>
              <span className="text-sm text-muted-foreground">
                Claude Code Configuration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReload}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading || !hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
                {hasChanges && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-yellow-400" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="models" className="gap-2">
              <Settings className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="mcp" className="gap-2">
              <Server className="h-4 w-4" />
              MCP Servers
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models">
            <ModelManager />
          </TabsContent>

          <TabsContent value="mcp">
            <McpManager />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsManager />
          </TabsContent>

          <TabsContent value="about">
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">ccGear</h2>
                <p className="text-muted-foreground">
                  A desktop application for configuring Claude Code settings,
                  including custom models, MCP servers, and permissions.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Configuration File</h3>
                <p className="text-sm text-muted-foreground">
                  Settings are stored in{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    ~/.claude/settings.json
                  </code>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Features</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Custom model management (BYOK)</li>
                  <li>MCP server configuration</li>
                  <li>Permission management (allow/deny tools)</li>
                  <li>Import/Export configuration</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Version</h3>
                <p className="text-sm text-muted-foreground">0.1.0</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
