"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { CustomFieldsEditor } from "@/components/ui/custom-fields-editor";
import { Button } from "@/components/ui/button";
import { type CustomField } from '@/types/settings';

const customFieldsSchema = z.object({
  member_fields: z.object({
    custom_fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      options: z.array(z.string()).optional(),
      required: z.boolean()
    }))
  }),
  event_settings: z.object({
    custom_fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean()
    }))
  }),
  group_settings: z.object({
    custom_fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      options: z.array(z.string()).optional(),
      required: z.boolean()
    }))
  })
});

type CustomFieldsValues = z.infer<typeof customFieldsSchema>;

export function CustomFieldsSettings() {
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const form = useForm<CustomFieldsValues>({
    resolver: zodResolver(customFieldsSchema),
    defaultValues: {
      member_fields: {
        custom_fields: []
      },
      event_settings: {
        custom_fields: []
      },
      group_settings: {
        custom_fields: []
      }
    }
  });

  const onSubmit = async (data: CustomFieldsValues) => {
    try {
      const { error } = await supabase
        .from('organization_settings')
        .update({
          member_fields: {
            ...form.getValues('member_fields'),
            custom_fields: data.member_fields.custom_fields
          },
          event_settings: {
            ...form.getValues('event_settings'),
            custom_fields: data.event_settings.custom_fields
          },
          group_settings: {
            ...form.getValues('group_settings'),
            custom_fields: data.group_settings.custom_fields
          }
        })
        .single();

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Custom fields have been saved successfully.",
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
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Custom Fields</CardTitle>
              <CardDescription>Configure custom fields for member profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="member_fields.custom_fields"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Fields</FormLabel>
                    <FormControl>
                      <CustomFieldsEditor
                        value={field.value}
                        onChange={field.onChange}
                        types={[
                          "text",
                          "number",
                          "date",
                          "select",
                          "multiselect",
                          "phone",
                          "email",
                          "url"
                        ]}
                        mode="member"
                      />
                    </FormControl>
                    <FormDescription>
                      Add custom fields to collect additional member information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Custom Fields</CardTitle>
              <CardDescription>Configure custom fields for events</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="event_settings.custom_fields"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Fields</FormLabel>
                    <FormControl>
                      <CustomFieldsEditor
                        value={field.value}
                        onChange={field.onChange}
                        types={[
                          "text",
                          "number",
                          "date",
                          "time",
                          "select",
                          "multiselect",
                          "url"
                        ]}
                        mode="event"
                      />
                    </FormControl>
                    <FormDescription>
                      Add custom fields to collect additional event information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Group Custom Fields</CardTitle>
              <CardDescription>Configure custom fields for groups</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="group_settings.custom_fields"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Fields</FormLabel>
                    <FormControl>
                      <CustomFieldsEditor
                        value={field.value}
                        onChange={field.onChange}
                        types={[
                          "text",
                          "number",
                          "select",
                          "multiselect",
                          "url"
                        ]}
                        mode="group"
                      />
                    </FormControl>
                    <FormDescription>
                      Add custom fields to collect additional group information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={!form.formState.isDirty}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 