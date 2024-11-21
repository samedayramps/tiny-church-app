import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

async function sendReminders() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", today.toISOString())
    .lt("date", tomorrow.toISOString());

  if (error) throw new Error("Error fetching events: " + error.message);

  for (const event of events) {
    const { data: attendees, error: attendeesError } = await supabase
      .from("event_attendees")
      .select("member_id, members.email, members.first_name")
      .eq("event_id", event.id)
      .innerJoin("members", "member_id", "id");

    if (attendeesError) throw new Error("Error fetching attendees: " + attendeesError.message);

    for (const attendee of attendees) {
      await sendEmail({
        to: attendee.email,
        subject: `Reminder: ${event.title}`,
        html: `<p>Hi ${attendee.first_name},</p><p>Don't forget about ${event.title} happening on ${event.date} at ${event.time}.</p>`,
      });
    }
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
  await sendReminders();
  return new Response("Reminders sent successfully");
});