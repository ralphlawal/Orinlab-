import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Use service role only in this webhook — it runs server-side and is never exposed to the client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const releaseId = session.metadata?.release_id;
    const artistEmail = session.metadata?.artist_email;
    const songTitle = session.metadata?.song_title;
    const artistName = session.metadata?.artist_name;

    if (!releaseId) {
      console.error("Webhook: no release_id in metadata");
      return NextResponse.json({ error: "No release_id" }, { status: 400 });
    }

    // Mark payment confirmed on the release
    const { error } = await supabase
      .from("releases")
      .update({ priority_paid: true })
      .eq("id", releaseId);

    if (error) {
      console.error("Webhook: failed to update release:", error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    // In-app notification
    if (artistEmail) {
      await supabase.from("notifications").insert({
        email: artistEmail,
        type: "payment",
        title: "Priority payment confirmed",
        body: `Your payment for priority distribution of "${songTitle}" has been received. We will process your release within 3 days.`,
        link: `/portal/releases/${releaseId}`,
      });
    }

    // Email confirmation to artist
    if (artistEmail) {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://orinlabi.com"}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment-confirmed",
          data: {
            email: artistEmail,
            artist_name: artistName,
            song_title: songTitle,
            release_id: releaseId,
          },
        }),
      }).catch(() => {});
    }

    // Notify admin
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://orinlabi.com"}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "admin-alert",
        subject: `Priority payment received — ${songTitle}`,
        body: `${artistName} (${artistEmail}) paid for priority distribution of "${songTitle}". Release ID: ${releaseId}`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
