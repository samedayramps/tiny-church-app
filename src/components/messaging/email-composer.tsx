"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, UsersRound } from "lucide-react";

const formSchema = z.object({
  to: z.enum(['all', 'group', 'individual']),
  groupIds: z.array(z.string()).optional(),
  recipients: z.array(z.string()).optional(),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Email content is required"),
  scheduledFor: z.string().optional().default(''),
  isTest: z.boolean().optional(),
});

interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export function EmailComposer() {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [recipientSearchOpen, setRecipientSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; email: string; name: string }>>([]);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Array<{ id: string; name: string }>>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: 'individual',
      groupIds: [],
      recipients: [],
      subject: '',
      content: '',
      scheduledFor: '',
      isTest: false,
    }
  });

  useEffect(() => {
    async function fetchGroups() {
      const { data } = await supabase.from('groups').select('id, name');
      if (data) setGroups(data);
    }
    fetchGroups();
  }, []);

  useEffect(() => {
    async function fetchAdminEmail() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setAdminEmail(session.user.email);
      }
    }
    fetchAdminEmail();
  }, [supabase]);

  useEffect(() => {
    if (form.watch('to') === 'individual' && searchQuery.length >= 2) {
      const fetchMembers = async () => {
        const { data } = await supabase
          .from('members')
          .select('id, email, first_name, last_name')
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .eq('status', 'active')
          .limit(10);
        
        setMembers(data || []);
        setShowMemberSearch(true);
      };

      fetchMembers();
    } else {
      setShowMemberSearch(false);
    }
  }, [searchQuery, form.watch('to')]);

  const searchMembers = async (query: string) => {
    if (query.length < 2) return;
    
    const { data } = await supabase
      .from('members')
      .select('id, email, first_name, last_name')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5);
      
    if (data) {
      setSearchResults(data.map(d => ({
        id: d.id,
        email: d.email,
        name: `${d.first_name} ${d.last_name}`
      })));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Show success toast with details from summary
      toast({
        variant: "default",
        title: "Email Action Complete",
        description: (
          <div className="mt-2 space-y-2 text-sm">
            {data.summary.successful > 0 && (
              <p className="flex items-center gap-2 text-green-600">
                <span>✓</span>
                {data.summary.successful} email(s) sent successfully
              </p>
            )}
            {data.summary.scheduled > 0 && (
              <p className="flex items-center gap-2 text-blue-600">
                <span>⏰</span>
                {data.summary.scheduled} email(s) scheduled
              </p>
            )}
            {data.summary.failed > 0 && (
              <p className="flex items-center gap-2 text-red-600">
                <span>⚠️</span>
                {data.summary.failed} email(s) failed to send
              </p>
            )}
          </div>
        ),
        duration: 3000,
        createdAt: Date.now(),
      });

      // Reset form if all emails were successful
      if (data.summary.failed === 0) {
        form.reset();
        setSelectedMembers([]);
        setSelectedGroups([]);
      }

    } catch (error) {
      console.error('Email send error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        duration: 3000,
        createdAt: Date.now(),
      });
    } finally {
      setLoading(false);
      setPreviewOpen(false);
    }
  };

  const handleSendTest = async () => {
    const values = form.getValues();
    await onSubmit({
      ...values,
      isTest: true,
      recipients: [values.recipients?.[0] || ''], // Send only to first recipient
    });
  };

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setPreviewOpen(true);
    }
  };

  const handleMemberSelect = (member: Member) => {
    const currentRecipients = form.watch('recipients') || [];
    if (!currentRecipients.includes(member.email)) {
      form.setValue('recipients', [...currentRecipients, member.email]);
      setSelectedMembers(prev => [...prev, member]);
    }
    setShowMemberSearch(false);
    setSearchQuery('');
  };

  const handleMemberRemove = (memberEmail: string) => {
    form.setValue('recipients', 
      (form.watch('recipients') || []).filter(email => email !== memberEmail)
    );
    setSelectedMembers(prev => prev.filter(m => m.email !== memberEmail));
  };

  const handleGroupSelect = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const currentGroupIds = form.watch('groupIds') || [];
      if (!currentGroupIds.includes(groupId)) {
        form.setValue('groupIds', [...currentGroupIds, groupId]);
        setSelectedGroups(prev => [...prev, group]);
      }
    }
  };

  const handleGroupRemove = (groupId: string) => {
    form.setValue('groupIds', 
      (form.watch('groupIds') || []).filter(id => id !== groupId)
    );
    setSelectedGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const renderSelectedRecipients = () => {
    return (
      <div className="mt-2">
        {selectedMembers.length > 0 && (
          <div className="mb-2">
            <p className="text-sm text-muted-foreground mb-1">Selected Members:</p>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map(member => (
                <Badge
                  key={member.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {member.first_name} {member.last_name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleMemberRemove(member.email)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedGroups.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Selected Groups:</p>
            <div className="flex flex-wrap gap-2">
              {selectedGroups.map(group => (
                <Badge
                  key={group.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {group.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleGroupRemove(group.id)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Recipients</h3>
                
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipients type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="individual">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Individual Members</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="group">
                            <div className="flex items-center gap-2">
                              <UsersRound className="h-4 w-4" />
                              <span>Groups</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>All Active Members</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(selectedMembers.length > 0 || selectedGroups.length > 0) && (
                  <div className="bg-background p-3 rounded-md">
                    {renderSelectedRecipients()}
                  </div>
                )}

                {form.watch('to') === 'individual' && (
                  <div className="relative">
                    <Input
                      placeholder="Search members by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                    {showMemberSearch && members.length > 0 && (
                      <Card className="absolute top-full left-0 right-0 z-50 mt-1">
                        <CardContent className="p-0">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {members.map((member) => (
                                  <CommandItem
                                    key={member.id}
                                    onSelect={() => {
                                      handleMemberSelect(member);
                                      setSearchQuery('');
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex flex-col">
                                      <span>{member.first_name} {member.last_name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {member.email}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {form.watch('to') === 'group' && (
                  <div className="space-y-2">
                    <Select onValueChange={handleGroupSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your message here..."
                          className="min-h-[200px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Delivery Options</h3>
                
                <FormField
                  control={form.control}
                  name="scheduledFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule For</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || '')}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange('')}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Schedule for later or leave empty to send immediately
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {form.watch('scheduledFor') ? 'Schedule Email' : 'Send Now'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePreview}
                  >
                    Preview
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSendTest}
                  disabled={loading}
                >
                  Send Test Email
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">To: </span>
              <span className="text-sm">
                {form.watch('to') === 'all' && 'All Members'}
                {form.watch('to') === 'group' && 'Group Members'}
                {form.watch('to') === 'individual' && form.watch('recipients')}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Subject: </span>
              <span className="text-sm">{form.watch('subject')}</span>
            </div>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap">{form.watch('content')}</div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSendTest}>
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 