// Supabase Edge Function: notify-new-enquiry
//
// Triggered by a Database Webhook on INSERT into the `enquiries` table.
// Emails the new enquiry's details via Resend. See README.md "Email
// notification for the contact form" for deploy steps.

const NOTIFY_TO = "cristina_cristina973@yahoo.com";

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    // Database Webhooks send { type, table, record, old_record, schema }
    const record = payload.record ?? payload;
    const { name, contact, message } = record;

    if (!name || !contact || !message) {
      return new Response(JSON.stringify({ error: "Missing enquiry fields" }), { status: 400 });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Resend's shared testing sender — works with no domain setup.
        // Once cmearwaxremoval.co.uk is verified in Resend, switch this to
        // something like "CM Ear Wax Removal <enquiries@cmearwaxremoval.co.uk>".
        from: "CM Ear Wax Removal <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        reply_to: typeof contact === "string" && contact.includes("@") ? contact : undefined,
        subject: `New enquiry from ${name}`,
        html: `
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Contact:</strong> ${escapeHtml(contact)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
          <hr>
          <p style="color:#888;font-size:12px">Sent automatically from the cmearwaxremoval.co.uk contact form.</p>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: errText }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
