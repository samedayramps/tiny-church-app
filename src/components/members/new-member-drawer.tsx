"use client";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { NewMemberForm } from "@/components/forms/new-member-form";
import type { Database } from '@/types/supabase';

type Member = Database['public']['Tables']['members']['Row'];
type NewMember = Database['public']['Tables']['members']['Insert'];

interface NewMemberDrawerProps {
  onSubmit: (member: Partial<NewMember>) => Promise<void>;
}

export function NewMemberDrawer({ onSubmit }: NewMemberDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="icon">
          <UserPlus className="h-4 w-4" />
          <span className="sr-only">Add new member</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4">
          <NewMemberForm 
            onSubmit={onSubmit}
            className="border-none"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
} 