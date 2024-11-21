"use client";

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import type { Database } from '@/types/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Filter, AlertCircle, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useSWR from 'swr';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

type EmailLog = Database['public']['Tables']['email_logs']['Row'];

type EmailStatus = 'sent' | 'failed' | 'scheduled' | 'pending';

interface EmailLogsResponse {
  logs: EmailLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface FilterOptions {
  status: EmailStatus | 'all';
  search: string;
  showTests: boolean;
  page: number;
  limit: number;
}

interface ApiError extends Error {
  info?: {
    message: string;
  };
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const info = await response.json();
    (error as ApiError).info = info;
    throw error;
  }
  return response.json();
};

const formatDate = (date: string | null) => {
  if (!date) return null;
  try {
    return format(new Date(date), 'PPp');
  } catch (error) {
    console.error('Invalid date format:', error);
    return null;
  }
};

const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case 'sent':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'scheduled':
      return 'secondary';
    case 'pending':
      return 'default';
    default:
      return 'outline';
  }
};

export function EmailLogs() {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    search: '',
    showTests: false,
    page: 1,
    limit: 50,
  });

  const { data, error, isLoading, mutate } = useSWR<EmailLogsResponse, ApiError>(
    `/api/messaging/logs?${new URLSearchParams({
      page: filters.page.toString(),
      limit: filters.limit.toString(),
      filter: filters.status,
      search: filters.search,
      showTests: filters.showTests.toString(),
    })}`,
    fetcher,
    { 
      refreshInterval: 5000,
      revalidateOnFocus: true,
      shouldRetryOnError: true,
    }
  );

  const handleRefresh = () => {
    mutate();
  };

  const handleFilterChange = (updates: Partial<FilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...updates,
      page: updates.status || updates.search !== undefined ? 1 : prev.page,
    }));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by email or subject..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFilterChange({ status: 'all' })}>
                All Emails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange({ status: 'sent' })}>
                Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange({ status: 'scheduled' })}>
                Scheduled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange({ status: 'failed' })}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange({ showTests: !filters.showTests })}>
                {filters.showTests ? 'Hide Test Emails' : 'Show Test Emails'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error.info?.message || 'Failed to load email logs'}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.scheduled_for)}</TableCell>
                    <TableCell>{formatDate(log.sent_at)}</TableCell>
                    <TableCell>{log.recipient_email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.is_test && (
                          <Badge variant="outline" className="mr-2">
                            TEST
                          </Badge>
                        )}
                        {log.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant={getStatusBadgeVariant(log.status)}>
                              {log.status}
                            </Badge>
                          </TooltipTrigger>
                          {log.error_message && (
                            <TooltipContent>
                              <p>Error: {log.error_message}</p>
                              {log.retry_count !== null && (
                                <p>Retry attempts: {log.retry_count}</p>
                              )}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!data?.logs.length && (
              <div className="py-8 text-center text-muted-foreground">
                No email logs found
              </div>
            )}

            {(data?.pagination.totalPages || 0) > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange({ page: filters.page - 1 })}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange({ page: filters.page + 1 })}
                  disabled={filters.page === data?.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 