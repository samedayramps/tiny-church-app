"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailComposer } from "./email-composer";

const TEMPLATES = {
  welcome: {
    subject: "Welcome to Our Church Family!",
    content: `Dear [Name],

We're delighted to welcome you to our church family! Thank you for joining us and becoming part of our community.

We'd love to help you get connected and learn more about our various ministries and activities.

Blessings,
[Church Name] Team`
  },
  event: {
    subject: "Upcoming Event: [Event Name]",
    content: `Dear [Name],

We're excited to invite you to [Event Name] on [Date] at [Time].

[Event Description]

Please RSVP by [Date] so we can plan accordingly.

Blessings,
[Church Name] Team`
  },
  prayer: {
    subject: "Prayer Request Update",
    content: `Dear Prayer Warriors,

We wanted to update you on recent prayer requests and praise reports from our church family:

[Prayer Points]

"Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours." - Mark 11:24

In Christ,
[Church Name] Prayer Team`
  }
};

export function EmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES | null>(null);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Select onValueChange={(value) => setSelectedTemplate(value as keyof typeof TEMPLATES)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome New Member</SelectItem>
                <SelectItem value="event">Event Announcement</SelectItem>
                <SelectItem value="prayer">Prayer Request Update</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedTemplate && (
              <div className="space-y-2">
                <h3 className="font-medium">Template Preview</h3>
                <div className="rounded-md bg-muted p-4">
                  <h4 className="font-medium">Subject: {TEMPLATES[selectedTemplate].subject}</h4>
                  <pre className="mt-2 whitespace-pre-wrap text-sm">
                    {TEMPLATES[selectedTemplate].content}
                  </pre>
                </div>
                <Button 
                  onClick={() => {
                    // TODO: Implement template loading into composer
                  }}
                >
                  Use Template
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 