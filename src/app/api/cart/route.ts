import { NextResponse } from "next/server";
import { insforgeSelect, insforgeInsert, insforgeDelete } from "@/lib/insforge-helpers";
import { ensurePublicUser } from "@/lib/sync-user";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    const { data, error } = await insforgeSelect("cart_items", {
      filters: { user_id: userId },
    });
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, items } = body;
    if (!user_id || !items) return NextResponse.json({ error: "user_id and items required" }, { status: 400 });

    const { error: delError } = await insforgeDelete("cart_items", { user_id });
    if (delError) return NextResponse.json({ error: delError }, { status: 500 });

    if (items.length === 0) return NextResponse.json({ success: true });

    let { data, error } = await insforgeInsert("cart_items", items.map((item: any) => ({
      user_id,
      product_id: item.product_id,
      variant_sku: item.variant_sku || null,
      quantity: item.quantity,
    })));

    if (error?.includes("violates foreign key constraint")) {
      try {
        const client = createServerClient({
          baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
          anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
          cookies: (await cookies()) as never,
        });
        const { data: userData } = await client.auth.getCurrentUser();
        if (userData?.user) {
          await ensurePublicUser(userData.user.id as string, userData.user.email ?? "");
          const retry = await insforgeInsert("cart_items", items.map((item: any) => ({
            user_id,
            product_id: item.product_id,
            variant_sku: item.variant_sku || null,
            quantity: item.quantity,
          })));
          data = retry.data;
          error = retry.error;
        }
      } catch {}
    }

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
