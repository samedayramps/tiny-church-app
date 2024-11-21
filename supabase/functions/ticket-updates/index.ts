// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

async function notifyTicketUpdate(payload) {
  const { id, user_id, status } = payload.new;

  const { data: user, error } = await supabase
    .from("members")
    .select("email, first_name")
    .eq("id", user_id)
    .single();

  if (error) throw new Error("Error fetching user: " + error.message);

  await sendEmail({
    to: user.email,
    subject: `Your Ticket #${id} Has Been Updated`,
    html: `<p>Hi ${user.first_name},</p><p>Your ticket status is now: ${status}.</p>`,
  });
}

async function sendEmail({ to, subject, html }) {
  const response = await fetch("https://api.resend.com/v1/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, html }),
  });

  if (!response.ok) throw new Error("Error sending email: " + await response.text());
}

serve(async (req) => {
  const { payload } = await req.json();
  await notifyTicketUpdate(payload);
  return new Response("Ticket notification sent successfully");
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ticket-updates' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
