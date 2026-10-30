
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return Response.redirect(`${origin}/?payment=failed`);
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secret || !supabaseUrl || !supabaseKey) {
      throw new Error("Payment settings are missing.");
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        cache: "no-store",
      }
    );

    const verification = await verifyResponse.json();

    if (
      !verifyResponse.ok ||
      !verification.status ||
      verification.data.status !== "success" ||
      verification.data.currency !== "GHS"
    ) {
      return Response.redirect(`${origin}/?payment=failed`);
    }

    const base = supabaseUrl.replace(/\/$/, "");
    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    const lookup = await fetch(
      `${base}/rest/v1/payments?reference=eq.${encodeURIComponent(reference)}&select=reference,amount_pesewa,status`,
      { headers, cache: "no-store" }
    );

    if (!lookup.ok) {
      throw new Error("Could not find payment record.");
    }

    const rows = await lookup.json();
    const payment = rows[0];

    if (!payment) {
      throw new Error("Payment record not found.");
    }

    if (verification.data.amount !== payment.amount_pesewa) {
      throw new Error("Payment amount does not match.");
    }

    if (payment.status !== "paid") {
      const update = await fetch(
        `${base}/rest/v1/payments?reference=eq.${encodeURIComponent(reference)}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            status: "paid",
            paid_at: new Date().toISOString(),
          }),
        }
      );

      if (!update.ok) {
        throw new Error("Could not update payment.");
      }
    }

    return Response.redirect(`${origin}/?payment=success`);
  } catch (error) {
    console.error("Payment verification error:", error);
    return Response.redirect(
      `${new URL(request.url).origin}/?payment=failed`
    );
  }
}
