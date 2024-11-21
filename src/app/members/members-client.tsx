"use client";

import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { MemberList } from '@/components/members/member-list';
import { NewMemberForm } from "@/components/forms/new-member-form";
import { MemberDetails } from "@/components/members/member-details";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Search } from "@/components/members/search";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { NewMemberDrawer } from "@/components/members/new-member-drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/components/ui/use-toast";

type Member = Database['public']['Tables']['members']['Row'];
type NewMember = Database['public']['Tables']['members']['Insert'];

interface MembersClientProps {
  initialMembers: Member[];
}

export function MembersClient({ initialMembers }: MembersClientProps) {
  // State
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [loading, setLoading] = useState(false);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(initialMembers);
  const [commandOpen, setCommandOpen] = useState(false);

  // Hooks
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toast } = useToast();
  
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 10;

  // Search effect
  useEffect(() => {
    const query = searchParams.get("query")?.toLowerCase();
    if (!query) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter((member) => 
      member.first_name.toLowerCase().includes(query) ||
      member.last_name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.phone?.toLowerCase().includes(query)
    );
    setFilteredMembers(filtered);
  }, [members, searchParams]);

  // Keyboard shortcut for command dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  // Member operations
  const handleAddMember = async (newMember: Partial<NewMember>) => {
    setLoading(true);
    try {
      if (!newMember.first_name || !newMember.last_name || !newMember.email) {
        throw new Error('Required fields missing');
      }

      const memberData: Database['public']['Tables']['members']['Insert'] = {
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
      if (data) {
        setMembers([...members, ...data]);
        setShowNewMemberForm(false);
        toast({
          title: "Member added",
          description: "New member has been successfully added.",
        });
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async (id: string, updates: Partial<Member>) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      if (data) {
        setMembers(members.map(m => m.id === id ? { ...m, ...data[0] } : m));
        if (selectedMember?.id === id) {
          setSelectedMember({ ...selectedMember, ...data[0] });
        }
        toast({
          title: "Member updated",
          description: "Member details have been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      
      setMembers(members.filter(m => m.id !== id));
      if (selectedMember?.id === id) setSelectedMember(null);
      toast({
        title: "Member deleted",
        description: "Member has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full bg-background">
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-4 py-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold">Members</h1>
            </div>

            <div className="flex items-center gap-4">
              <Search className="max-w-md" />
              
              {/* Desktop Add Button */}
              {isDesktop ? (
                <Button 
                  onClick={() => setShowNewMemberForm(!showNewMemberForm)}
                  variant={showNewMemberForm ? "secondary" : "default"}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {showNewMemberForm ? 'Cancel' : 'Add Member'}
                </Button>
              ) : (
                <NewMemberDrawer onSubmit={handleAddMember} />
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col px-4">
              {/* Desktop Form */}
              {showNewMemberForm && isDesktop && (
                <div className="py-4 shrink-0">
                  <NewMemberForm 
                    onSubmit={handleAddMember}
                    className="bg-card/50 rounded-lg border shadow-sm"
                  />
                </div>
              )}

              {/* Member List */}
              <div className="flex-1 min-h-0 py-4">
                <MemberList
                  members={currentMembers}
                  onUpdateMember={handleUpdateMember}
                  onDeleteMember={handleDeleteMember}
                  onSelectMember={setSelectedMember}
                  selectedMemberId={selectedMember?.id}
                  isLoading={loading}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel - Desktop */}
        {isDesktop && (
          <div className="hidden md:block w-[400px] border-l bg-background/50">
            <div className="p-4 h-full">
              {selectedMember ? (
                <MemberDetails
                  member={selectedMember}
                  className="h-full"
                  mode="card"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select a member to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Member Details Dialog */}
        {!isDesktop && selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Member Details</DialogTitle>
              </DialogHeader>
              <MemberDetails
                member={selectedMember}
                mode="dialog"
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Command Dialog for Quick Search */}
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup heading="Members">
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  onSelect={() => {
                    setCommandOpen(false);
                    setSelectedMember(member);
                  }}
                >
                  {member.first_name} {member.last_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </div>
  );
} 