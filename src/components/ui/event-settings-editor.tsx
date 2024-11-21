"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { type EventSettings } from '@/types/settings';

interface EventSettingsEditorProps {
  value: EventSettings;
  onChange: (value: EventSettings) => void;
}

export function EventSettingsEditor({ value, onChange }: EventSettingsEditorProps) {
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    if (!newCategory) return;
    onChange({
      ...value,
      categories: [...value.categories, newCategory],
    });
    setNewCategory("");
  };

  const removeCategory = (index: number) => {
    const newCategories = [...value.categories];
    newCategories.splice(index, 1);
    onChange({ ...value, categories: newCategories });
  };

  const updateSetting = (key: keyof EventSettings, newValue: any) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Event Categories</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={addCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"
            >
              <span>{category}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => removeCategory(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Event Features</Label>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow attendees to register for events
                  </p>
                </div>
                <Switch
                  checked={value.registration_enabled}
                  onCheckedChange={(checked) =>
                    updateSetting("registration_enabled", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow comments on events
                  </p>
                </div>
                <Switch
                  checked={value.allow_comments}
                  onCheckedChange={(checked) =>
                    updateSetting("allow_comments", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Photos</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow photo uploads for events
                  </p>
                </div>
                <Switch
                  checked={value.allow_photos}
                  onCheckedChange={(checked) =>
                    updateSetting("allow_photos", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Attendance Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track attendance for events
                  </p>
                </div>
                <Switch
                  checked={value.attendance_tracking}
                  onCheckedChange={(checked) =>
                    updateSetting("attendance_tracking", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Reminder Hours</Label>
                <Input
                  type="number"
                  value={value.reminder_hours}
                  onChange={(e) =>
                    updateSetting("reminder_hours", parseInt(e.target.value))
                  }
                  min={0}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 