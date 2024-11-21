import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  console.log('Starting email send process...');
  try {
    const body = await request.json();
    console.log('Request body:', { 
      to: body.to, 
      isTest: body.isTest, 
      subject: body.subject,
      scheduledFor: body.scheduledFor,
      groupIds: body.groupIds,
      recipients: body.recipients
    });

    // Validate required fields
    if (!body.subject?.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      );
    }

    // Validate recipients based on send mode
    if (body.to === 'individual' && (!body.recipients || body.recipients.length === 0)) {
      return NextResponse.json(
        { error: 'At least one recipient email is required for individual mode' },
        { status: 400 }
      );
    }

    if (body.to === 'group' && (!body.groupIds || body.groupIds.length === 0)) {
      return NextResponse.json(
        { error: 'At least one group must be selected for group mode' },
        { status: 400 }
      );
    }

    // Create supabase client with admin privileges to bypass RLS
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
    });
    
    const BATCH_SIZE = 50;
    let recipients: string[] = [];
    
    if (body.isTest || body.to === 'individual') {
      recipients = Array.isArray(body.recipients) ? body.recipients : [body.recipients];
      console.log('Individual/Test email mode, recipient:', recipients);
    } else if (body.to === 'all') {
      console.log('Fetching all active members...');
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('email')
        .eq('status', 'active')
        .order('email');
      
      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }
      recipients = members?.map(m => m.email) || [];
      console.log(`Found ${recipients.length} active members`);
    } else if (body.to === 'group' && body.groupIds?.length > 0) {
      console.log('Fetching group members for groups:', body.groupIds);
      const { data: members, error: groupError } = await supabase
        .from('member_groups')
        .select('members!inner(email)')
        .in('group_id', body.groupIds);
      
      if (groupError) {
        console.error('Error fetching group members:', groupError);
        throw groupError;
      }
      recipients = members?.map(m => m.members.email) || [];
      console.log(`Found ${recipients.length} group members`);
    }

    console.log(`Processing ${recipients.length} recipients in batches of ${BATCH_SIZE}`);
    
    const now = new Date();
    const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    const results = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (to) => {
          try {
            // Create email log entry
            const { data: emailLog, error: logError } = await supabase
              .from('email_logs')
              .insert({
                recipient_email: to,
                subject: body.subject,
                body: body.content,
                status: scheduledFor && scheduledFor > now ? 'scheduled' : 'pending',
                scheduled_for: scheduledFor?.toISOString() || null,
                is_test: body.isTest || false,
              })
              .select()
              .single();

            if (logError) {
              console.error(`Error creating email log for ${to}:`, logError);
              throw logError;
            }

            if (!emailLog) {
              throw new Error('Failed to create email log');
            }

            // Only send immediately if not scheduled for future
            if (!scheduledFor || scheduledFor <= now) {
              console.log(`Sending email to ${to}`);
              await resend.emails.send({
                from: `${process.env.NEXT_PUBLIC_SENDER_NAME} <${process.env.NEXT_PUBLIC_SENDER_EMAIL}>`,
                to: [to],
                subject: body.subject,
                html: body.content,
              });
              console.log(`Email sent successfully to ${to}`);

              // Update log status to sent
              const { error: updateError } = await supabase
                .from('email_logs')
                .update({ 
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                })
                .eq('id', emailLog.id);

              if (updateError) {
                console.error(`Error updating log status for ${to}:`, updateError);
                throw updateError;
              }

              return { 
                success: true, 
                to, 
                log: emailLog,
                scheduled: scheduledFor && scheduledFor > now 
              };
            }
            
            return { 
              success: true, 
              to, 
              log: emailLog,
              scheduled: true 
            };

          } catch (error) {
            console.error(`Error processing email for ${to}:`, error);
            return { 
              success: false, 
              to, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        })
      );
      results.push(...batchResults);
    }

    const summary = {
      total: recipients.length,
      successful: results.filter(r => r.success && !r.scheduled).length,
      scheduled: results.filter(r => r.success && r.scheduled).length,
      failed: results.filter(r => !r.success).length
    };

    console.log('Email process completed:', summary);
    return NextResponse.json({ results, summary });

  } catch (error) {
    console.error('Fatal error in email send process:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 