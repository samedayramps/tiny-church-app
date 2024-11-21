"use server";

import { createClient } from '@supabase/supabase-js';
import { Resend } from "resend";
import { z } from "zod";
import type { Database } from '@/types/supabase';
import { welcomeEmailTemplate } from '@/emails/welcome-email';

const resend = new Resend(process.env.RESEND_API_KEY);

// Create a Supabase client with the service role key
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema for email signup
const emailSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function submitEmailSignup(formData: { email: string }) {
  try {
    // Validate email
    const validatedFields = emailSignupSchema.safeParse(formData);

    if (!validatedFields.success) {
      return { 
        success: false, 
        error: "Invalid email address"
      };
    }

    const data = {
      email: validatedFields.data.email,
      signup_date: new Date().toISOString(),
    };

    // Add to Resend audience
    try {
      await resend.contacts.create({
        email: data.email,
        firstName: '', // Optional: Add if you collect first name
        lastName: '', // Optional: Add if you collect last name
        audienceId: process.env.RESEND_AUDIENCE_ID!, // Make sure to add this to your .env file
        unsubscribed: false,
      });
    } catch (resendError: any) {
      // If the contact already exists, we can continue
      if (resendError?.statusCode !== 409) {
        console.error("Resend error:", resendError);
        return {
          success: false,
          error: "Failed to add to mailing list. Please try again."
        };
      }
    }

    // Insert into Supabase
    const { error: dbError } = await supabase
      .from("email_signups")
      .insert([data]);

    if (dbError) {
      // Handle duplicate email error gracefully
      if (dbError.code === '23505') {
        return {
          success: false,
          error: "You're already signed up for updates!"
        };
      }
      console.error("Database error:", dbError);
      return {
        success: false,
        error: "Failed to save your email. Please try again."
      };
    }

    // Send welcome email
    await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_SENDER_NAME} <${process.env.NEXT_PUBLIC_SENDER_EMAIL}>`,
      to: data.email,
      subject: "Welcome to Tiny Church Updates",
      html: welcomeEmailTemplate(data.email),
      headers: {
        'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_UNSUBSCRIBE_URL}?email=${data.email}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Entity-Ref-ID': `welcome-${Date.now()}`, // Prevents threading in Gmail
      },
      tags: [
        {
          name: 'email_type',
          value: 'welcome',
        },
      ],
    });

    // If everything succeeds
    return { 
      success: true,
      message: "Thanks for signing up! Check your email for confirmation."
    };

  } catch (error) {
    console.error("Error processing signup:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
} 