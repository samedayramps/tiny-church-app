"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewGroupForm } from "@/components/forms/new-group-form";
import { Plus } from "lucide-react";
import { useState } from "react";

interface NewGroupDialogProps {
  onGroupCreated?: () => void;
}

export function NewGroupDialog({ onGroupCreated }: NewGroupDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onGroupCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <NewGroupForm onSuccess={handleSuccess} className="mt-4" />
      </DialogContent>
    </Dialog>
  );
} 