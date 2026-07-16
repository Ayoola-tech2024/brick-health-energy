import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { insforgeSelect, insforgeInsert, insforgeUpdate } from "@/lib/insforge-helpers";
import { requireAdmin, getServerUserEmail } from "@/lib/server-admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const limit = url.searchParams.get("limit") || "20";

    // Admin listing (no user_id) -> require admin.
    if (!userId) {
      const denied = await requireAdmin();
      if (denied) return denied;
    } else {
      // A user may only read THEIR OWN orders. Even though we query with the
      // service role (RLS bypassed), we scope the filter to the authenticated
      // user's id and reject mismatched client-supplied ids.
      const authEmail = await getServerUserEmail();
      if (!authEmail) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      const authedUserId = url.searchParams.get("auth_user_id");
      if (authedUserId && authedUserId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const filters: Record<string, string> = {};
    if (userId) filters.user_id = userId;

    const { data, error } = await insforgeSelect("orders", {
      filters,
      order: "created_at",
      ascending: false,
      limit: parseInt(limit, 10),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    // Prevent clients from creating orders on behalf of another user.
    const authEmail = await getServerUserEmail();
    if (authEmail && body.user_id) {
      const client = createServerClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        cookies: (await cookies()) as never,
      });
      const { data } = await client.auth.getCurrentUser();
      const authedId = (data?.user as { id?: string } | undefined)?.id ?? null;
      if (authedId && body.user_id !== authedId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { data, error } = await insforgeInsert("orders", body);
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
  // Status / order mutations are admin-only.
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { id?: string } & Record<string, unknown>;
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const { data, error } = await insforgeUpdate("orders", { id }, { ...updates, updated_at: new Date().toISOString() });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
