
export const runtime = "nodejs";

const packages = {
  starter: {
    name: "Starter",
    amount: 35000,
    uploads: 2,
    odds: "2–5",
  },
  silver: {
    name: "Silver",
    amount: 55000,
    uploads: 3,
    odds: "5–10",
  },
  gold: {
    name: "Gold",
    amount: 85000,
    uploads: 4,
    odds: "10–20",
  },
  vip: {
    name: "VIP",
    amount: 100000,
    uploads: 5,
    odds: "20–30",
  },
};

export async function POST(request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return Response.json(
        { error: "Paystack is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { packageId, email } = body;

    const selected = packages[packageId];

    if (!selected || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Choose a valid package and enter your email." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: selected.amount,
          currency: "GHS",
          channels: ["card", "mobile_money"],
          callback_url: `${new URL(request.url).origin}/api/paystack/verify`,
          metadata: {
            package_id: packageId,
            package_name: selected.name,
            uploads: selected.uploads,
            odds: selected.odds,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      return Response.json(
        { error: result.message || "Payment could not be started." },
        { status: 400 }
      );
    }
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase is not configured.");
}

const savePayment = await fetch(
  `${supabaseUrl}/rest/v1/payments`,
  {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      reference: result.data.reference,
      email,
      package_id: packageId,
      amount_pesewas: selected.amount,
      uploads: selected.uploads,
      status: "pending",
    }),
  }
);

if (!savePayment.ok) {
  throw new Error("Could not save pending payment.");
}
    return Response.json({
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (error) {
    return Response.json(
      { error: "Unable to initialize payment." },
      { status: 500 }
    );
  }
}
