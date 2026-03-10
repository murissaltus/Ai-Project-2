export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Webhook } from "svix";
import { NextRequest, NextResponse } from "next/server";

type Event = {
  type: string;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email_addresses: { email_address: string }[];
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_KEY;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 400 },
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const webhook = new Webhook(webhookSecret);
  const body = await req.text();

  try {
    const event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Event;

    if (event.type !== "user.created") {
      return NextResponse.json({ message: "Ignored event" });
    }

    const { email_addresses, first_name, last_name, id } = event.data;

    const { prisma } = await import("@/lib/prisma");

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {},
      create: {
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        clerkId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook verification error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 500 });
  }
}
