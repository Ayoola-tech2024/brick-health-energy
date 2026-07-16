import { NextResponse } from "next/server";
import { insforgeSelect, insforgeInsert, insforgeUpdate } from "@/lib/insforge-helpers";
import { requireAdmin } from "@/lib/server-admin";

export async function GET() {
  const { data, error } = await insforgeSelect("products");
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}

// Create / update products are admin-only (service role bypasses RLS).
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { data, error } = await insforgeInsert("products", body);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { id?: string } & Record<string, unknown>;
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    const { data, error } = await insforgeUpdate("products", { id }, { ...updates, updated_at: new Date().toISOString() });
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
