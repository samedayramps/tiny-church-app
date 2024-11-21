"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { ServiceTimesEditor } from "@/components/ui/service-times-editor";
import { Button } from "@/components/ui/button";
import { type ServiceTime } from '@/types/settings';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const serviceSettingsSchema = z.object({
  service_times: z.array(z.object({
    day: z.string(),
    time: z.string(),
    name: z.string().min(1, "Service name is required")
  }))
});

type ServiceSettingsValues = z.infer<typeof serviceSettingsSchema>;

export function ServiceSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const [isLoading, setIsLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const form = useForm<ServiceSettingsValues>({
    resolver: zodResolver(serviceSettingsSchema),
    defaultValues: {
      service_times: []
    }
  });

  useEffect(() => {
    async function fetchServiceTimes() {
      try {
        setIsLoading(true);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          router.push('/login?callbackUrl=/settings/services');
          return;
        }

        const { data: settings, error: fetchError } = await supabase
          .from('organization_settings')
          .select('id, service_times')
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!settings) {
          const { data: newSettings, error: createError } = await supabase
            .from('organization_settings')
            .insert([{
              church_name: 'My Church',
              denomination: 'Not Specified',
              year_established: new Date().getFullYear(),
              tax_id: 'Pending',
              email: session.user.email || '',
              phone: '',
              website_url: '',
              social_media: {},
              address: '',
              city: '',
              state: '',
              postal_code: '',
              country: 'United States',
              service_times: [],
              logo_url: '',
              primary_color: '#000000',
              secondary_color: '#ffffff',
              default_email_sender_name: 'My Church',
              default_email_footer: '',
              enable_sms_notifications: false,
              enable_email_notifications: true,
              member_directory_visibility: 'private',
              allow_member_signups: false,
              require_member_approval: true,
              member_fields: {
                required_fields: ['first_name', 'last_name', 'email'],
                optional_fields: [],
                custom_fields: []
              },
              event_categories: [],
              event_registration_default: true,
              event_reminder_hours: 24,
              group_types: [],
              allow_group_creation: false,
              timezone: 'UTC',
              date_format: 'YYYY-MM-DD',
              time_format: 'HH:mm',
              currency: 'USD',
              language: 'en',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_updated_by: session.user.id,
              group_settings: {
                types: [],
                custom_fields: [],
                allow_resources: true,
                allow_discussions: true,
                allow_events: true,
                allow_subgroups: false
              }
            }])
            .select('id, service_times')
            .single();

          if (createError) throw createError;
          if (!newSettings) throw new Error('Failed to create settings');

          setSettingsId(newSettings.id);
          form.reset({ service_times: [] });
        } else {
          setSettingsId(settings.id);
          form.reset({
            service_times: settings.service_times || []
          });
        }
      } catch (error) {
        console.error('Error fetching service times:', error);
        
        if (error instanceof Error) {
          if (error.message === 'Not authenticated') {
            toast({
              title: "Authentication Required",
              description: "Please sign in to access settings.",
              variant: "destructive",
            });
            router.push('/auth/login?callbackUrl=/settings/services');
          } else {
            toast({
              title: "Error Loading Settings",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load settings. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchServiceTimes();
  }, [supabase, toast, form, router]);

  const onSubmit = async (data: ServiceSettingsValues) => {
    if (!settingsId) {
      toast({
        title: "Error",
        description: "Settings ID not found. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      toast({
        title: "Saving changes...",
        description: "Please wait while we update your service times.",
      });

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: settingsId,
          service_times: data.service_times,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update settings');
      }

      form.reset(data);
      
      toast({
        title: "Settings updated",
        description: `Successfully saved ${data.service_times.length} service time${data.service_times.length === 1 ? '' : 's'}.`,
        variant: "success",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      
      toast({
        title: "Failed to save changes",
        description: error instanceof Error 
          ? error.message 
          : "There was a problem updating your service times. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceTimesChange = (newTimes: ServiceTime[]) => {
    form.setValue('service_times', newTimes, {
      shouldDirty: true,
      shouldValidate: true
    });

    if (newTimes.length > form.getValues('service_times').length) {
      toast({
        title: "Service time added",
        description: "Don't forget to save your changes.",
        variant: "info",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Times</CardTitle>
        <CardDescription>Configure your regular service schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="service_times"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Schedule</FormLabel>
                  <FormControl>
                    <ServiceTimesEditor
                      value={field.value}
                      onChange={handleServiceTimesChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!form.formState.isDirty || isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 