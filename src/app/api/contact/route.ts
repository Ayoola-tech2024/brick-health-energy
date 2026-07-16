import { NextResponse } from "next/server";
import { insforgeInsert } from "@/lib/insforge-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required: name, email, subject, message" },
        { status: 400 }
      );
    }

    const { data, error } = await insforgeInsert("contact_messages", {
      name,
      email,
      subject,
      message,
      status: "new",
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
