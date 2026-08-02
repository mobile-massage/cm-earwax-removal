// Supabase Edge Function: notify-new-submission
//
// Invoked by two SQL triggers (supabase/migrations/) on INSERT into
// `enquiries` and `reviews`. Emails the addresses below via Resend so
// nothing sits unnoticed in the database. See README.md "Email
// notification for the contact form and reviews" for deploy steps.

const NOTIFY_TO = ["cristina_cristina973@yahoo.com", "info@cmearwaxremoval.co.uk", "craig@quaydale.com"];

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmail(table: string, record: Record<string, unknown>): { subject: string; html: string; replyTo?: string } | null {
  if (table === "enquiries") {
    const { name, contact, message } = record as { name?: string; contact?: string; message?: string };
    if (!name || !contact || !message) return null;
    return {
      subject: `New enquiry from ${name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Contact:</strong> ${escapeHtml(contact)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color:#888;font-size:12px">Sent automatically from the cmearwaxremoval.co.uk contact form.</p>
      `,
      replyTo: typeof contact === "string" && contact.includes("@") ? contact : undefined,
    };
  }

  if (table === "reviews") {
    const { name, rating, body } = record as { name?: string; rating?: number; body?: string };
    if (!name || !rating || !body) return null;
    return {
      subject: `New ${rating}-star review from ${name} (pending approval)`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Rating:</strong> ${"★".repeat(rating)}${"☆".repeat(Math.max(0, 5 - rating))} (${rating}/5)</p>
        <p><strong>Review:</strong></p>
        <p>${escapeHtml(body).replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color:#888;font-size:12px">Sent automatically when a new review is submitted on cmearwaxremoval.co.uk. Approve or decline it in the admin panel.</p>
      `,
    };
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    // Database Webhooks send { type, table, record, old_record, schema }
    const table: string = payload.table;
    const record = payload.record ?? payload;

    const email = buildEmail(table, record);
    if (!email) {
      return new Response(JSON.stringify({ error: `Unrecognized table or missing fields: ${table}` }), { status: 400 });
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
        from: "CM Ear Wax Removal <enquiries@cmearwaxremoval.co.uk>",
        to: NOTIFY_TO,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
        subject: email.subject,
        html: email.html,
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
