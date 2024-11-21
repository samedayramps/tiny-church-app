"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { EventSettingsEditor } from "@/components/ui/event-settings-editor";
import { Button } from "@/components/ui/button";
import { type EventSettings } from '@/types/settings';

const eventSettingsSchema = z.object({
  event_settings: z.object({
    categories: z.array(z.string()),
    custom_fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean()
    })),
    registration_enabled: z.boolean(),
    reminder_hours: z.number(),
    allow_comments: z.boolean(),
    allow_photos: z.boolean(),
    attendance_tracking: z.boolean()
  })
});

type EventSettingsValues = z.infer<typeof eventSettingsSchema>;

export function EventSettings() {
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const form = useForm<EventSettingsValues>({
    resolver: zodResolver(eventSettingsSchema),
    defaultValues: {
      event_settings: {
        categories: [],
        custom_fields: [],
        registration_enabled: true,
        reminder_hours: 24,
        allow_comments: true,
        allow_photos: true,
        attendance_tracking: true
      }
    }
  });

  const onSubmit = async (data: EventSettingsValues) => {
    try {
      const { error } = await supabase
        .from('organization_settings')
        .update({
          event_settings: data.event_settings
        })
        .single();

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Event settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Settings</CardTitle>
        <CardDescription>Configure event categories and features</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="event_settings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Configuration</FormLabel>
                  <FormControl>
                    <EventSettingsEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 