"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CustomFieldsEditor } from "./custom-fields-editor";
import { type GroupSettings } from '@/types/settings';

interface GroupSettingsEditorProps {
  value: {
    types: string[];
    allow_resources: boolean;
    allow_discussions: boolean;
    allow_events: boolean;
    allow_subgroups: boolean;
  };
  onChange: (value: GroupSettingsEditorProps['value']) => void;
}

export function GroupSettingsEditor({ value, onChange }: GroupSettingsEditorProps) {
  const [newType, setNewType] = useState("");

  const addType = () => {
    if (!newType) return;
    onChange({
      ...value,
      types: [...value.types, newType],
    });
    setNewType("");
  };

  const removeType = (index: number) => {
    const newTypes = [...value.types];
    newTypes.splice(index, 1);
    onChange({ ...value, types: newTypes });
  };

  const updateSetting = (key: keyof GroupSettings, newValue: any) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Group Types</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add group type"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={addType}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.types.map((type, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"
            >
              <span>{type}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => removeType(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Group Features</Label>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resources</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow groups to manage resources
                  </p>
                </div>
                <Switch
                  checked={value.allow_resources}
                  onCheckedChange={(checked) =>
                    updateSetting("allow_resources", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Discussions</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable group discussions
                  </p>
                </div>
                <Switch
                  checked={value.allow_discussions}
                  onCheckedChange={(checked) =>
                    updateSetting("allow_discussions", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Events</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow groups to create events
                  </p>
                </div>
                <Switch
                  checked={value.allow_events}
                  onCheckedChange={(checked) =>
                    updateSetting("allow_events", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Subgroups</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow creation of subgroups
                  </p>
                </div>
                <Switch
                  checked={value.allow_subgroups}
                  onCheckedChange={(checked) =>
                    updateSetting("allow_subgroups", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 