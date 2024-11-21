"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ServiceTime } from '@/types/settings';

interface ServiceTimesEditorProps {
  value: ServiceTime[];
  onChange: (value: ServiceTime[]) => void;
}

export function ServiceTimesEditor({ value, onChange }: ServiceTimesEditorProps) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const addServiceTime = () => {
    onChange([
      ...value,
      { day: "Sunday", time: "09:00", name: "New Service" },
    ]);
  };

  const removeServiceTime = (index: number) => {
    const newTimes = [...value];
    newTimes.splice(index, 1);
    onChange(newTimes);
  };

  const updateServiceTime = (index: number, field: keyof ServiceTime, newValue: string) => {
    const newTimes = [...value];
    newTimes[index] = { ...newTimes[index], [field]: newValue };
    onChange(newTimes);
  };

  return (
    <div className="space-y-4">
      {value.map((service, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select
                      value={service.day}
                      onValueChange={(value) =>
                        updateServiceTime(index, "day", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={service.time}
                      onChange={(e) =>
                        updateServiceTime(index, "time", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Service Name</Label>
                    <Input
                      value={service.name}
                      onChange={(e) =>
                        updateServiceTime(index, "name", e.target.value)
                      }
                      placeholder="e.g. Morning Service"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={() => removeServiceTime(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button 
        type="button" 
        variant="outline" 
        onClick={addServiceTime}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Service Time
      </Button>
    </div>
  );
} 