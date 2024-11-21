"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewEventForm } from "@/components/forms/new-event-form";
import { Plus } from "lucide-react";
import { useState } from "react";

interface NewEventDialogProps {
  onEventCreated?: () => void;
}

export function NewEventDialog({ onEventCreated }: NewEventDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onEventCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <NewEventForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
} 