import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { PLANS } from "@/lib/stripePlans";

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!); }
function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

const SITE = "https://orinlabi.com";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Subscription created / renewed ───────────────────────────────────────
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const priceId    = sub.items.data[0]?.price.id;
    const plan       = PLANS.find(p => p.priceId === priceId);

    if (!plan) {
      console.error("Webhook: unknown price ID", priceId);
      return NextResponse.json({ received: true });
    }

    const customer   = await getStripe().customers.retrieve(customerId) as Stripe.Customer;
    const email      = customer.email;
    if (!email) return NextResponse.json({ received: true });

    const periodEnd  = (sub as unknown as { current_period_end: number }).current_period_end;
    const expiresAt  = new Date(periodEnd * 1000).toISOString();
    const isActive   = sub.status === "active" || sub.status === "trialing";

    await getSupabase().from("artist_profiles").upsert({
      email,
      plan:                   isActive ? plan.key : null,
      plan_status:            sub.status,
      stripe_customer_id:     customerId,
      stripe_subscription_id: sub.id,
      plan_expires_at:        expiresAt,
    }, { onConflict: "email" });

    if (event.type === "customer.subscription.created") {
      await getSupabase().from("notifications").insert({
        email,
        type:  "plan",
        title: `Welcome to ${plan.name}!`,
        body:  `Your ${plan.name} plan is now active. You can now submit unlimited releases and keep 100% of your royalties.`,
        link:  "/portal/billing",
      });

      fetch(`${SITE}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "plan-activated",
          data: { email, plan_name: plan.name, plan_key: plan.key, expires_at: expiresAt },
        }),
      }).catch(() => {});
    }
  }

  // ── Subscription cancelled ────────────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const sub        = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const customer   = await getStripe().customers.retrieve(customerId) as Stripe.Customer;
    const email      = customer.email;
    if (!email) return NextResponse.json({ received: true });

    await getSupabase().from("artist_profiles").upsert({
      email,
      plan:                   null,
      plan_status:            "cancelled",
      stripe_subscription_id: null,
      plan_expires_at:        null,
    }, { onConflict: "email" });

    await getSupabase().from("notifications").insert({
      email,
      type:  "plan",
      title: "Your subscription has ended",
      body:  "Your OrinlabÍ Records plan has been cancelled. You can resubscribe anytime to continue releasing music.",
      link:  "/pricing",
    });
  }

  // ── Payment failed ────────────────────────────────────────────────────────
  if (event.type === "invoice.payment_failed") {
    const invoice    = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    const customer   = await getStripe().customers.retrieve(customerId) as Stripe.Customer;
    const email      = customer.email;
    if (email) {
      await getSupabase().from("notifications").insert({
        email,
        type:  "plan",
        title: "Payment failed — action required",
        body:  "We couldn't process your subscription payment. Please update your billing details to keep your plan active.",
        link:  "/portal/billing",
      });
    }
  }

  // ── One-time checkout (add-ons + priority distribution) ──────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Subscription checkout — activate plan immediately (don't wait for subscription.created)
    if (session.mode === "subscription" && session.subscription) {
      const sub     = await getStripe().subscriptions.retrieve(session.subscription as string);
      const priceId = sub.items.data[0]?.price.id;
      const plan    = PLANS.find(p => p.priceId === priceId);
      const email   = session.customer_email ?? (session.customer_details as { email?: string } | null)?.email ?? null;

      if (plan && email) {
        await getSupabase().from("artist_profiles").upsert({
          email,
          plan:                   plan.key,
          plan_status:            "active",
          stripe_customer_id:     session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }, { onConflict: "email" });
      }
      return NextResponse.json({ received: true });
    }

    if (session.mode !== "payment") return NextResponse.json({ received: true });

    const releaseId   = session.metadata?.release_id;
    const addonKey    = session.metadata?.addon_key;
    const artistEmail = session.metadata?.artist_email;
    const songTitle   = session.metadata?.song_title;
    const artistName  = session.metadata?.artist_name;

    // Priority distribution payment
    if (addonKey === "addon_priority" && releaseId) {
      await getSupabase().from("releases").update({ priority_paid: true }).eq("id", releaseId);

      if (artistEmail) {
        await getSupabase().from("notifications").insert({
          email: artistEmail,
          type:  "payment",
          title: "Priority payment confirmed",
          body:  `Your payment for priority distribution of "${songTitle}" has been received. Your release will be processed within 3 days.`,
          link:  `/portal/releases/${releaseId}`,
        });
        fetch(`${SITE}/api/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "payment-confirmed",
            data: { email: artistEmail, artist_name: artistName, song_title: songTitle, release_id: releaseId },
          }),
        }).catch(() => {});
      }
    }

    // Playlist pitch payment
    if (addonKey === "addon_pitch" && releaseId) {
      await getSupabase().from("releases").update({ pitch_paid: true }).eq("id", releaseId);
      if (artistEmail) {
        await getSupabase().from("notifications").insert({
          email: artistEmail,
          type:  "payment",
          title: "Playlist pitch payment confirmed",
          body:  `Your playlist pitch for "${songTitle}" has been paid. Our team will begin the submission process.`,
          link:  `/portal/releases/${releaseId}`,
        });
      }
    }

    // Notify admin of all add-on payments
    fetch(`${SITE}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type:    "admin-alert",
        subject: `Add-on payment: ${addonKey} — ${songTitle ?? "N/A"}`,
        body:    `${artistName} (${artistEmail}) paid for ${addonKey}. Release: ${releaseId ?? "N/A"}`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
