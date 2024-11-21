import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    // Remove from Resend audience
    try {
      await resend.contacts.update({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID!,
        unsubscribed: true,
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      // Continue even if Resend fails - we still want to update our database
    }

    // Update Supabase
    const { error: dbError } = await supabase
      .from('email_signups')
      .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
      .eq('email', email);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      );
    }

    // Send confirmation email
    await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_SENDER_NAME} <${process.env.NEXT_PUBLIC_SENDER_EMAIL}>`,
      to: email,
      subject: "You've been unsubscribed",
      html: `
        <h2>Unsubscribe Confirmation</h2>
        <p>You have been successfully unsubscribed from Tiny Church updates.</p>
        <p>If you change your mind, you can always sign up again on our website.</p>
        <p>Best regards,<br>The Tiny Church Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
} 