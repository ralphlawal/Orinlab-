import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS, ADDONS } from "@/lib/stripePlans";

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!); }
const ORIGIN = "https://orinlabi.com";

export async function POST(req: NextRequest) {
  try {
    const { priceKey, email, artistName, releaseId, songTitle, mode, returnTo } = await req.json();
    // mode: "subscription" | "addon"

    if (!priceKey || !email) {
      return NextResponse.json({ error: "Missing priceKey or email" }, { status: 400 });
    }

    if (mode === "subscription") {
      const plan = PLANS.find(p => p.key === priceKey);
      if (!plan) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

      // returnTo must be a relative /portal/* path to prevent open redirects
      const safeReturn = typeof returnTo === "string" && returnTo.startsWith("/portal/") ? returnTo : null;
      const successUrl = safeReturn
        ? `${ORIGIN}${safeReturn}?subscribed=1&plan=${plan.key}`
        : `${ORIGIN}/portal/billing?subscribed=1&plan=${plan.key}`;

      const session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        line_items: [{ price: plan.priceId, quantity: 1 }],
        metadata: { plan_key: plan.key, artist_email: email, artist_name: artistName ?? "" },
        success_url: successUrl,
        cancel_url: `${ORIGIN}/pricing`,
        allow_promotion_codes: true,
      });

      return NextResponse.json({ url: session.url });
    }

    if (mode === "addon") {
      const addon = ADDONS.find(a => a.key === priceKey);
      if (!addon) return NextResponse.json({ error: "Unknown addon" }, { status: 400 });

      const meta: Record<string, string> = {
        addon_key:    addon.key,
        artist_email: email,
        artist_name:  artistName ?? "",
      };
      if (releaseId)  meta.release_id  = releaseId;
      if (songTitle)  meta.song_title  = songTitle;

      // Describe what this is for in the line item
      const description = releaseId && songTitle
        ? `${addon.description} — "${songTitle}"`
        : addon.description;

      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(addon.amountUsd * 100),
            product_data: {
              name: `OrinlabÍ Records — ${addon.name}`,
              description,
            },
          },
        }],
        metadata: meta,
        success_url: releaseId
          ? `${ORIGIN}/portal/payment/success?session_id={CHECKOUT_SESSION_ID}&release_id=${releaseId}&addon=${addon.key}`
          : `${ORIGIN}/portal/billing?addon_paid=${addon.key}`,
        cancel_url: `${ORIGIN}/portal`,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("Stripe subscribe error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
