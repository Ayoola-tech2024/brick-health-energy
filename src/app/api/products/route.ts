import { NextResponse } from "next/server";
import { insforgeSelect } from "@/lib/insforge-helpers";

export async function GET() {
  const { data, error } = await insforgeSelect("products");
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}
