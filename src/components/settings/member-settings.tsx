"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const memberSettingsSchema = z.object({
  member_directory_visibility: z.enum(['public', 'members', 'private']).default('private'),
  allow_member_signups: z.boolean().default(false),
  require_member_approval: z.boolean().default(true),
  allow_member_login: z.boolean().default(true)
});

type MemberSettingsValues = z.infer<typeof memberSettingsSchema>;

export function MemberSettings() {
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const form = useForm<MemberSettingsValues>({
    resolver: zodResolver(memberSettingsSchema),
    defaultValues: {
      member_directory_visibility: 'private',
      allow_member_signups: false,
      require_member_approval: true,
      allow_member_login: true
    }
  });

  const onSubmit = async (data: MemberSettingsValues) => {
    try {
      const { error } = await supabase
        .from('organization_settings')
        .update(data)
        .single();

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Member settings have been saved successfully.",
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
        <CardTitle>Member Settings</CardTitle>
        <CardDescription>Configure member profile fields and requirements</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Directory Settings</h3>
              <FormField
                control={form.control}
                name="member_directory_visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Directory Visibility</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="private">Private (Staff Only)</option>
                        <option value="members">Members Only</option>
                        <option value="public">Public</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Member Access</h3>
              
              <FormField
                control={form.control}
                name="allow_member_signups"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Member Signups</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Allow new members to create their own accounts
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="require_member_approval"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Approval</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        New member accounts require staff approval
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allow_member_login"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Member Login</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Allow members to log in to their accounts
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 