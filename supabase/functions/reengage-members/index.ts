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

async function reengageInactiveMembers() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: inactiveMembers, error } = await supabase
    .from("members")
    .select("email, first_name")
    .eq("status", "inactive")
    .lt("date_added", sixMonthsAgo.toISOString());

  if (error) throw new Error("Error fetching inactive members: " + error.message);

  for (const member of inactiveMembers) {
    await sendEmail({
      to: member.email,
      subject: "We miss you at [Your Church Name]!",
      html: `<p>Hi ${member.first_name},</p><p>We've noticed you haven't been active recently. We'd love to see you again!</p>`,
    });
  }
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

serve(async () => {
  await reengageInactiveMembers();
  return new Response("Re-engagement emails sent successfully");
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reengage-members' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
