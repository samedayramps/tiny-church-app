"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database, OrganizationSettings } from '@/types/supabase';
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/ui/color-picker";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { CustomFieldsEditor } from "@/components/ui/custom-fields-editor";
import { EventSettingsEditor } from "@/components/ui/event-settings-editor";
import { ServiceTimesEditor } from "@/components/ui/service-times-editor";
import { GroupSettingsEditor } from "@/components/ui/group-settings-editor";

const settingsFormSchema = z.object({
  church_name: z.string().min(2),
  year_established: z.number().optional(),
  tax_id: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  website_url: z.string().url().optional(),
  social_media: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    youtube: z.string().url().optional()
  }).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('United States'),
  service_times: z.array(z.object({
    day: z.string(),
    time: z.string(),
    name: z.string()
  })),
  logo_url: z.string().url().optional(),
  primary_color: z.string(),
  secondary_color: z.string(),
  default_email_sender_name: z.string().optional(),
  default_email_footer: z.string().optional(),
  enable_sms_notifications: z.boolean(),
  enable_email_notifications: z.boolean(),
  member_fields: z.object({
    required_fields: z.array(z.string()),
    optional_fields: z.array(z.string()),
    custom_fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      options: z.array(z.string()).optional(),
      required: z.boolean()
    }))
  }),
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
  }),
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
  }),
  timezone: z.string(),
  date_format: z.string(),
  time_format: z.string(),
  currency: z.string().default('USD'),
  language: z.string().default('en')
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsClientProps {
  initialSettings: OrganizationSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  // Initialize default values with empty strings for nullable fields
  const defaultValues = {
    ...initialSettings,
    church_name: initialSettings.church_name || '',
    email: initialSettings.email || '',
    phone: initialSettings.phone || '',
    website_url: initialSettings.website_url || '',
    social_media: initialSettings.social_media || {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
    address: initialSettings.address || '',
    city: initialSettings.city || '',
    state: initialSettings.state || '',
    postal_code: initialSettings.postal_code || '',
    country: initialSettings.country || 'United States',
    logo_url: initialSettings.logo_url || '',
    primary_color: initialSettings.primary_color || '#000000',
    secondary_color: initialSettings.secondary_color || '#ffffff',
    default_email_sender_name: initialSettings.default_email_sender_name || '',
    default_email_footer: initialSettings.default_email_footer || '',
    timezone: initialSettings.timezone || 'UTC',
    date_format: initialSettings.date_format || 'yyyy-MM-dd',
    time_format: initialSettings.time_format || 'HH:mm',
    currency: initialSettings.currency || 'USD',
    language: initialSettings.language || 'en',
    service_times: initialSettings.service_times || [],
    member_fields: initialSettings.member_fields || {
      required_fields: ['first_name', 'last_name', 'email'],
      optional_fields: [],
      custom_fields: []
    },
    event_settings: initialSettings.event_settings || {
      categories: [],
      custom_fields: [],
      registration_enabled: true,
      reminder_hours: 24,
      allow_comments: true,
      allow_photos: true,
      attendance_tracking: true
    },
    group_settings: initialSettings.group_settings || {
      types: [],
      custom_fields: [],
      allow_resources: true,
      allow_discussions: true,
      allow_events: true,
      allow_subgroups: true
    }
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('organization_settings')
        .update(data)
        .eq('id', initialSettings.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization's settings and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="services">Service Times</TabsTrigger>
            <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>
                      Basic information about your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="church_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Church Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="year_established"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Established</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="tax_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax ID</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Contact Information</h3>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Location</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="postal_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <CardTitle>Member Settings</CardTitle>
                    <CardDescription>Configure member profile fields and requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="member_fields"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member Fields Configuration</FormLabel>
                          <FormControl>
                            <CustomFieldsEditor
                              value={field.value}
                              onChange={field.onChange}
                              types={["text", "number", "date", "select", "multiselect"]}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Settings</CardTitle>
                    <CardDescription>Configure event categories and features</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="branding">
                <Card>
                  <CardHeader>
                    <CardTitle>Branding</CardTitle>
                    <CardDescription>
                      Customize your organization's appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="logo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" />
                          </FormControl>
                          <FormDescription>
                            Enter the URL of your organization's logo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="primary_color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <FormControl>
                              <ColorPicker {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="secondary_color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <FormControl>
                              <ColorPicker {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Settings</CardTitle>
                    <CardDescription>
                      Configure how you communicate with your members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="default_email_sender_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Sender Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="default_email_footer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Footer</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="enable_email_notifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>Enable email notifications for events and updates</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enable_sms_notifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                SMS Notifications
                              </FormLabel>
                              <FormDescription>
                                Enable SMS notifications for important updates
                              </FormDescription>
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

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Social Media</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="social_media.facebook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facebook</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://facebook.com/..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Add similar fields for instagram, twitter, youtube */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Configure system-wide settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <FormControl>
                            <TimezoneSelect {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="date_format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="time_format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Format</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Times</CardTitle>
                    <CardDescription>Configure your regular service schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="service_times"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Schedule</FormLabel>
                          <FormControl>
                            <ServiceTimesEditor
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="groups">
                <Card>
                  <CardHeader>
                    <CardTitle>Group Settings</CardTitle>
                    <CardDescription>Configure group types and features</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custom-fields">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Member Custom Fields</CardTitle>
                      <CardDescription>
                        Configure custom fields for member profiles
                      </CardDescription>
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
                                mode="custom"
                              />
                            </FormControl>
                            <FormDescription>
                              Add custom fields to collect additional member information
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Event Custom Fields</CardTitle>
                      <CardDescription>
                        Configure custom fields for events
                      </CardDescription>
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
                                mode="custom"
                              />
                            </FormControl>
                            <FormDescription>
                              Add custom fields to collect additional event information
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Group Custom Fields</CardTitle>
                      <CardDescription>
                        Configure custom fields for groups
                      </CardDescription>
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
                                mode="custom"
                              />
                            </FormControl>
                            <FormDescription>
                              Add custom fields to collect additional group information
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
} 