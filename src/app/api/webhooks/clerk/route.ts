import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    primary_email_address_id: string;
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const headerPayload = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  const body = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, headerPayload) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "user.created") {
    const { id, email_addresses, primary_email_address_id } = event.data;
    const primaryEmail = email_addresses.find(
      (e) => e.id === primary_email_address_id
    );

    if (primaryEmail) {
      await db.user.upsert({
        where: { id },
        update: { email: primaryEmail.email_address },
        create: {
          id,
          email: primaryEmail.email_address,
        },
      });
    }
  }

  if (event.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id } = event.data;
    const primaryEmail = email_addresses.find(
      (e) => e.id === primary_email_address_id
    );

    if (primaryEmail) {
      await db.user.upsert({
        where: { id },
        update: { email: primaryEmail.email_address },
        create: {
          id,
          email: primaryEmail.email_address,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
