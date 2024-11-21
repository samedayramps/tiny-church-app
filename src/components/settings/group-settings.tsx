"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { GroupSettingsEditor } from "@/components/ui/group-settings-editor";
import { Button } from "@/components/ui/button";
import { type GroupSettings } from '@/types/settings';

const groupSettingsSchema = z.object({
  group_settings: z.object({
    types: z.array(z.string()),
    custom_fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      options: z.array(z.string()).optional(),
      required: z.boolean()
    })),
    allow_resources: z.boolean(),
    allow_discussions: z.boolean(),
    allow_events: z.boolean(),
    allow_subgroups: z.boolean()
  })
});

type GroupSettingsValues = z.infer<typeof groupSettingsSchema>;

export function GroupSettings() {
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const form = useForm<GroupSettingsValues>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      group_settings: {
        types: [],
        custom_fields: [],
        allow_resources: true,
        allow_discussions: true,
        allow_events: true,
        allow_subgroups: true
      }
    }
  });

  const onSubmit = async (data: GroupSettingsValues) => {
    try {
      const { error } = await supabase
        .from('organization_settings')
        .update({
          group_settings: data.group_settings
        })
        .single();

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Group settings have been saved successfully.",
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
        <CardTitle>Group Settings</CardTitle>
        <CardDescription>Configure group types and features</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="group_settings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Configuration</FormLabel>
                  <FormControl>
                    <GroupSettingsEditor
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