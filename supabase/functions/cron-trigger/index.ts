import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-scheduled-emails`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isBatch: true }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to process emails: ${await response.text()}`);
    }

    return new Response("Emails processed successfully", { status: 200 });
  } catch (error) {
    console.error("Cron job error:", error);
    return new Response(error.message, { status: 500 });
  }
}); 