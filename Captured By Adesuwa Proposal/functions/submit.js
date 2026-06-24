export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // 1. Read payload incoming from the frontend form submission
    const formData = await request.json();
    const { clientName, contactEmail, signatureText, currentPriceText } = formData;

    // 2. Safe serverless fetch payload dispatching to Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Proposals <onboarding@resend.dev>",
        to: ["YOUR_OWN_REAL_EMAIL@GMAIL.COM"], // 👈 CHANGE THIS to your real email inbox!
        subject: `📸 Proposal Signed! — ${clientName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; border: 1px solid #eee;">
            <h2 style="color: #ca8a04; text-transform: uppercase; tracking: wide;">Deal Secured! 🥂</h2>
            <p>Your premium photography project proposal has been accepted and digitally signed.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            
            <p><strong>Client Name:</strong> ${clientName}</p>
            <p><strong>Client Email:</strong> ${contactEmail}</p>
            <p><strong>Digital Signature:</strong> <span style="font-family: monospace; background: #f4f4f5; padding: 2px 6px; border-radius: 4px;">${signatureText}</span></p>
            <p><strong>Final Investment:</strong> ${currentPriceText}</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #71717a;">Dispatched securely via Captured By Adesuwa Engine.</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorResponse = await resendResponse.text();
      return new Response(`Email Dispatch Failure: ${errorResponse}`, { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
  }
}
