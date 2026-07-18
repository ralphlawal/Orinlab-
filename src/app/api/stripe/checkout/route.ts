import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!); }

const PRIORITY_PRICE_USD = 1500; // $15.00 in cents

export async function POST(req: NextRequest) {
  try {
    const { releaseId, songTitle, artistName, artistEmail } = await req.json();

    if (!releaseId || !artistEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "https://orinlabi.com";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: artistEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRIORITY_PRICE_USD,
            product_data: {
              name: "Priority Distribution",
              description: `Fast-track distribution for "${songTitle}" — delivered within 3 days`,
              images: ["https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"],
            },
          },
        },
      ],
      metadata: {
        release_id: releaseId,
        artist_name: artistName,
        artist_email: artistEmail,
        song_title: songTitle,
      },
      success_url: `${origin}/portal/payment/success?session_id={CHECKOUT_SESSION_ID}&release_id=${releaseId}`,
      cancel_url: `${origin}/portal/releases/${releaseId}?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
