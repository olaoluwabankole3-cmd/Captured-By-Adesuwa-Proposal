export const onRequestPost: PagesFunction<{ RESEND_API_KEY: string }> = async (context) => {
  try {
    const { request, env } = context;
    
    // 1. Catch the data sent from your frontend submit function
    const formData = await request.json();
    const { clientName, contactEmail, signatureText, currentPrice, gymName } = formData;

    // 2. Safely ping Resend's API via clean serverless fetch
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Note: 'onboarding@resend.dev' works out of the box for testing to your own signup email.
        from: "Proposals <onboarding@resend.dev>",
        to: ["stakr.dev@GMAIL.COM"], // 👈 CHANGE THIS to your personal inbox email!
        subject: `🎉 Proposal Signed! — ${clientName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; border: 1px solid #eee;">
            <h2 style="color: #10b981; text-transform: uppercase; tracking: wide;">Deal Secured! 🥂</h2>
            <p>Your proposal has been officially accepted and digitally signed.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            
            <p><strong>Client Name:</strong> ${clientName}</p>
            <p><strong>Client Email:</strong> ${contactEmail}</p>
            <p><strong>Digital Signature:</strong> <span style="font-family: monospace; background: #f4f4f5; padding: 2px 6px; border-radius: 4px;">${signatureText}</span></p>
            <p><strong>Project Context/Brand:</strong> ${gymName || "Photography Client"}</p>
            <p><strong>Final Investment Tier:</strong> ${currentPrice}</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #71717a;">Dispatched securely via Cloudflare Edge Worker Architecture.</p>
          </div>
        `,
      }),
    });

    // 3. Handle any downstream email delivery failures gracefully
    if (!resendResponse.ok) {
      const errorResponse = await resendResponse.text();
      console.error("Resend API Failure response:", errorResponse);
      return new Response(`Email Dispatch Failure: ${errorResponse}`, { status: 500 });
    }

    // Return a clean 200 OK block to your application interface
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Edge Function internal exception thrown:", err.message);
    return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
  }
};
