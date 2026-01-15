import { useState } from "react";
import { Plus, Trash2, Edit2, Copy, Eye, EyeOff } from "lucide-react";
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
import type { CustomModel } from "@/types";

const PROVIDERS = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "generic-chat-completion-api", label: "Generic API" },
] as const;

function generateId(): string {
  return `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const defaultModel: Omit<CustomModel, "id"> = {
  model: "",
  displayName: "",
  baseUrl: "",
  apiKey: "",
  provider: "generic-chat-completion-api",
  maxOutputTokens: 16384,
};

export function ModelManager() {
  const { settings, addCustomModel, updateCustomModel, removeCustomModel } =
    useSettingsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<CustomModel | null>(null);
  const [formData, setFormData] = useState<Omit<CustomModel, "id">>(defaultModel);
  const [showApiKey, setShowApiKey] = useState(false);

  const models = settings.customModels || [];

  const handleAdd = () => {
    setEditingModel(null);
    setFormData(defaultModel);
    setShowApiKey(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (model: CustomModel) => {
    setEditingModel(model);
    setFormData({
      model: model.model,
      displayName: model.displayName,
      baseUrl: model.baseUrl,
      apiKey: model.apiKey,
      provider: model.provider,
      maxOutputTokens: model.maxOutputTokens,
    });
    setShowApiKey(false);
    setIsDialogOpen(true);
  };

  const handleCopy = (model: CustomModel) => {
    const newModel: CustomModel = {
      ...model,
      id: generateId(),
      displayName: `${model.displayName} (Copy)`,
    };
    addCustomModel(newModel);
  };

  const handleDelete = (id: string) => {
    removeCustomModel(id);
  };

  const handleSave = () => {
    if (!formData.model || !formData.displayName) {
      return;
    }

    if (editingModel) {
      updateCustomModel(editingModel.id, formData);
    } else {
      const newModel: CustomModel = {
        id: generateId(),
        ...formData,
      };
      addCustomModel(newModel);
    }

    setIsDialogOpen(false);
    setEditingModel(null);
    setFormData(defaultModel);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Custom Models</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-3 pr-4">
          {models.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No custom models configured. Click "Add Model" to get started.
              </CardContent>
            </Card>
          ) : (
            models.map((model) => (
              <Card key={model.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {model.displayName}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(model)}
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(model)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(model.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2 text-sm text-muted-foreground">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Model:</span> {model.model}
                    </div>
                    <div>
                      <span className="font-medium">Provider:</span>{" "}
                      {PROVIDERS.find((p) => p.value === model.provider)?.label}
                    </div>
                    <div className="col-span-2 truncate">
                      <span className="font-medium">Base URL:</span>{" "}
                      {model.baseUrl}
                    </div>
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
              {editingModel ? "Edit Model" : "Add Model"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="My Custom Model"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model ID</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                placeholder="gpt-4o, claude-3-opus, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    provider: e.target.value as CustomModel["provider"],
                  })
                }
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) =>
                  setFormData({ ...formData, baseUrl: e.target.value })
                }
                placeholder="https://api.openai.com/v1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  placeholder="sk-..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxOutputTokens">Max Output Tokens</Label>
              <Input
                id="maxOutputTokens"
                type="number"
                value={formData.maxOutputTokens || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxOutputTokens: parseInt(e.target.value) || undefined,
                  })
                }
                placeholder="16384"
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
