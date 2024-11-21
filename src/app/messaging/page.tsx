"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailComposer } from "@/components/messaging/email-composer";
import { EmailLogs } from "@/components/messaging/email-logs";
import { EmailTemplates } from "@/components/messaging/email-templates";

export default function MessagingPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Messaging Center</h1>
          <p className="text-muted-foreground">
            Send emails and manage communication with members
          </p>
        </div>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="logs">Email Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-4">
            <EmailComposer />
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <EmailTemplates />
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <EmailLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 