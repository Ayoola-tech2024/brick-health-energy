import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { insforgeSelect, insforgeInsert, insforgeDelete } from "@/lib/insforge-helpers";
import { ensurePublicUser } from "@/lib/sync-user";

async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const client = createServerClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
      cookies: (await cookies()) as never,
    });
    const { data } = await client.auth.getCurrentUser();
    return (data?.user as { id?: string } | undefined)?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data, error } = await insforgeSelect("wishlist", {
      filters: { user_id: userId },
      order: "created_at",
      ascending: false,
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
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { product_id } = (await req.json()) as { product_id?: string };
    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    let { data, error } = await insforgeInsert("wishlist", {
      user_id: userId,
      product_id,
    });

    if (error?.includes("violates foreign key constraint")) {
      const client = createServerClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        cookies: (await cookies()) as never,
      });
      const { data: userData } = await client.auth.getCurrentUser();
      if (userData?.user) {
        await ensurePublicUser(userData.user.id as string, userData.user.email ?? "");
        const retry = await insforgeInsert("wishlist", {
          user_id: userId,
          product_id,
        });
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { product_id } = (await req.json()) as { product_id?: string };
    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    const { data, error } = await insforgeDelete("wishlist", {
      user_id: userId,
      product_id,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
