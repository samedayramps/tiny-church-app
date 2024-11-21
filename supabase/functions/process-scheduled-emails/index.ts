import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  try {
    const { isBatch } = await req.json();
    
    if (isBatch) {
      const now = new Date();
      
      // Fetch pending emails that are due to be sent
      const { data: pendingEmails, error: fetchError } = await supabase
        .from('email_logs')
        .select('*')
        .in('status', ['pending', 'scheduled'])
        .lte('scheduled_for', now.toISOString())
        .limit(50); // Process in batches

      if (fetchError) {
        throw new Error(`Failed to fetch pending emails: ${fetchError.message}`);
      }

      const results = await Promise.allSettled(
        pendingEmails.map(async (email) => {
          try {
            await resend.emails.send({
              from: `${Deno.env.get('SENDER_NAME')} <${Deno.env.get('SENDER_EMAIL')}>`,
              to: email.recipient_email,
              subject: email.subject,
              html: email.body,
            });

            await supabase
              .from('email_logs')
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString(),
              })
              .eq('id', email.id);

            return { id: email.id, status: 'sent' };
          } catch (error) {
            const retryCount = (email.retry_count || 0) + 1;
            const status = retryCount >= 3 ? 'failed' : 'scheduled';

            await supabase
              .from('email_logs')
              .update({ 
                status,
                retry_count: retryCount,
                error_message: error instanceof Error ? error.message : 'Unknown error',
              })
              .eq('id', email.id);

            return { id: email.id, status, error: error.message };
          }
        })
      );

      return new Response(JSON.stringify({ results }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle single email processing (your existing code)
    const { id, scheduled_for, recipient_email, subject, body } = await req.json();
    
    // Check if it's time to send the email
    const now = new Date();
    const scheduledTime = new Date(scheduled_for);
    
    if (scheduledTime > now) {
      return new Response('Email scheduled for future', { status: 200 });
    }

    try {
      // Send the email
      await resend.emails.send({
        from: `${Deno.env.get('SENDER_NAME')} <${Deno.env.get('SENDER_EMAIL')}>`,
        to: recipient_email,
        subject: subject,
        html: body,
      });

      // Update status to sent
      await supabase
        .from('email_logs')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', id);

      return new Response('Email sent successfully', { status: 200 });

    } catch (error) {
      console.error(`Failed to send email ${id}:`, error);
      
      const { data: currentLog } = await supabase
        .from('email_logs')
        .select('retry_count')
        .eq('id', id)
        .single();
      
      const retryCount = ((currentLog?.retry_count || 0) + 1);
      const status = retryCount >= 3 ? 'failed' : 'scheduled';
      
      await supabase
        .from('email_logs')
        .update({ 
          status,
          retry_count: retryCount,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', id);

      return new Response('Failed to send email', { status: 500 });
    }
  } catch (error) {
    console.error('Process scheduled emails error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 