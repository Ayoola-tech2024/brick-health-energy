import { NextResponse } from "next/server";
import { insforgeInsert } from "@/lib/insforge-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, error } = await insforgeInsert("orders", body);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
