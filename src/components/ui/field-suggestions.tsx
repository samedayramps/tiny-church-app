"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb } from "lucide-react";

interface FieldSuggestion {
  name: string;
  type: string;
  options?: string[];
  required: boolean;
  description?: string;
}

const memberSuggestions: FieldSuggestion[] = [
  {
    name: "baptism_date",
    type: "date",
    required: false,
    description: "Date of baptism"
  },
  {
    name: "spiritual_gifts",
    type: "multiselect",
    required: false,
    options: ["Teaching", "Worship", "Service", "Leadership", "Hospitality"],
    description: "Spiritual gifts and talents"
  },
  {
    name: "ministry_interests",
    type: "multiselect",
    required: false,
    options: ["Children", "Youth", "Worship", "Outreach", "Prayer"],
    description: "Ministry interests"
  },
  {
    name: "emergency_contact",
    type: "text",
    required: false,
    description: "Emergency contact information"
  }
];

const eventSuggestions: FieldSuggestion[] = [
  {
    name: "max_attendees",
    type: "number",
    required: false,
    description: "Maximum number of attendees"
  },
  {
    name: "materials_needed",
    type: "text",
    required: false,
    description: "Required materials or equipment"
  },
  {
    name: "setup_time",
    type: "time",
    required: false,
    description: "Setup time before event"
  },
  {
    name: "volunteers_needed",
    type: "number",
    required: false,
    description: "Number of volunteers needed"
  }
];

const groupSuggestions: FieldSuggestion[] = [
  {
    name: "meeting_frequency",
    type: "select",
    required: false,
    options: ["Weekly", "Bi-weekly", "Monthly"],
    description: "How often the group meets"
  },
  {
    name: "target_size",
    type: "number",
    required: false,
    description: "Target group size"
  },
  {
    name: "requirements",
    type: "text",
    required: false,
    description: "Requirements for joining"
  },
  {
    name: "resources_budget",
    type: "number",
    required: false,
    description: "Resources budget"
  }
];

interface FieldSuggestionsProps {
  type: 'member' | 'event' | 'group';
  onSelect: (suggestion: FieldSuggestion) => void;
}

export function FieldSuggestions({ type, onSelect }: FieldSuggestionsProps) {
  const suggestions = type === "member" 
    ? memberSuggestions 
    : type === "event" 
    ? eventSuggestions 
    : groupSuggestions;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Lightbulb className="h-4 w-4 mr-2" />
          Suggestions
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <ScrollArea className="h-72">
          <div className="space-y-4 p-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.name}
                className="space-y-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => onSelect(suggestion)}
              >
                <div className="font-medium">{suggestion.name}</div>
                <div className="text-sm text-muted-foreground">
                  {suggestion.description}
                </div>
                <div className="text-sm">Type: {suggestion.type}</div>
                {suggestion.options && (
                  <div className="text-sm text-muted-foreground">
                    Options: {suggestion.options.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 