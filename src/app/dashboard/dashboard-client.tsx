"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, UserPlus, Mail, UserCheck, UserX } from "lucide-react";
import { format } from 'date-fns';
import Link from 'next/link';
import type { Database } from '@/types/supabase';
import { NewMemberDrawer } from "@/components/members/new-member-drawer";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DashboardClientProps {
  initialEvents: Array<{
    id: string;
    title: string;
    description: string | null;
    date: string;
    time: string;
    location: string | null;
    recurring: boolean;
    recurring_pattern: any | null;
    created_at: string;
    attendee_count: number;
  }>;
  memberStats: {
    active: number;
    inactive: number;
    total: number;
  };
}

export function DashboardClient({ initialEvents, memberStats }: DashboardClientProps) {
  const [stats, setStats] = useState(memberStats);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const handleAddMember = async (newMember: any) => {
    try {
      if (!newMember.first_name || !newMember.last_name || !newMember.email) {
        throw new Error('Required fields missing');
      }

      const memberData = {
        first_name: newMember.first_name,
        last_name: newMember.last_name,
        email: newMember.email,
        phone: newMember.phone ?? null,
        notes: newMember.notes ?? null,
        photo_url: newMember.photo_url ?? null,
        status: 'active',
        date_added: new Date().toISOString(),
        address: null,
        custom_fields: null
      };

      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select();
      
      if (error) throw error;
      
      // Update member stats
      setStats(prev => ({
        ...prev,
        active: prev.active + 1,
        total: prev.total + 1
      }));

      toast({
        title: "Member added",
        description: "New member has been successfully added.",
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="space-x-2">
          <NewMemberDrawer onSubmit={handleAddMember} />
          <Link href="/messaging">
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {initialEvents.map((event) => (
              <Link 
                key={event.id} 
                href={`/events/${event.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{event.title}</h3>
                    <div className="text-sm text-muted-foreground space-x-2">
                      <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                      {event.location && (
                        <>
                          <span>•</span>
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {event.attendee_count} attending
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
            {initialEvents.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No upcoming events
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 