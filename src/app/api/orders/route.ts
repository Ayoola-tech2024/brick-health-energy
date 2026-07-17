import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { insforgeSelect, insforgeInsert, insforgeUpdate } from "@/lib/insforge-helpers";
import { requireAdmin, getServerUserEmail } from "@/lib/server-admin";
import { adminOrderEmail, customerConfirmationEmail } from "@/lib/email-templates";

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

    const orderId = url.searchParams.get("id");

    const filters: Record<string, string> = {};
    if (orderId) filters.id = orderId;
    if (userId) filters.user_id = userId;

    const { data, error } = await insforgeSelect("orders", {
      filters,
      order: orderId ? undefined : "created_at",
      ascending: orderId ? undefined : false,
      limit: orderId ? 1 : parseInt(limit, 10),
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

const ORDER_ITEM_PRICES: Record<string, number> = {
  "premium-briquettes-10kg": 5000,
  "eco-pellets-15kg": 7500,
  "smokeless-stove-ordinary": 35000,
  "teg-smart-stove": 75000,
  "travel-stove-compact": 18000,
  "commercial-teg-stove": 210000,
};

const FREE_DELIVERY_THRESHOLD = 50000;
const STANDARD_DELIVERY_FEE = 2000;
const COD_SURCHARGE = 2500;

async function sendOrderEmails(order: Record<string, any>) {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_INSFORGE_URL ?? "").replace(/\/$/, "");
    const serviceKey = process.env.INSFORGE_SERVICE_ROLE_KEY ?? "";
    if (!baseUrl || !serviceKey) return;

    const orderData = {
      id: order.id,
      items: Array.isArray(order.items) ? order.items : [],
      subtotal: order.subtotal ?? 0,
      delivery_fee: order.delivery_fee ?? 0,
      total: order.total ?? 0,
      payment_method: order.payment_method ?? "",
      delivery_name: order.delivery_name ?? "",
      delivery_phone: order.delivery_phone ?? "",
      delivery_email: order.delivery_email ?? "",
      delivery_address: order.delivery_address ?? "",
      delivery_city: order.delivery_city ?? "",
      delivery_state: order.delivery_state ?? "",
      created_at: order.created_at,
    };

    // Send admin notification
    const admin = adminOrderEmail(orderData);
    await fetch(`${baseUrl}/api/email/send-raw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        to: ["info@brickhealthenergy.org", "damisileayoola@gmail.com", "adamsromeo163@gmail.com"],
        subject: admin.subject,
        html: admin.html,
      }),
    });

    // Send customer confirmation if we have their email
    const customerEmail = order.delivery_email as string | undefined;
    if (customerEmail) {
      const customer = customerConfirmationEmail(orderData);
      await fetch(`${baseUrl}/api/email/send-raw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          to: [customerEmail],
          subject: customer.subject,
          html: customer.html,
        }),
      });
    }
  } catch {
    // emails are best-effort
  }
}

function validateOrderPrices(body: Record<string, unknown>): string | null {
  const items = body.items as any[] | undefined;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return "Order must contain at least one item";
  }

  let calculatedSubtotal = 0;
  for (const item of items) {
    const price = ORDER_ITEM_PRICES[item.product_id];
    if (price === undefined) {
      return `Unknown product: ${item.product_id}`;
    }
    if (item.price !== price) {
      return `Price mismatch for ${item.product_id}: expected ${price}, got ${item.price}`;
    }
    if (typeof item.quantity !== "number" || item.quantity < 1) {
      return `Invalid quantity for ${item.product_id}`;
    }
    calculatedSubtotal += price * item.quantity;
  }

  const paymentMethod = body.payment_method as string | undefined;
  const deliveryFee = calculatedSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const codSurcharge = paymentMethod === "cod" ? COD_SURCHARGE : 0;
  const total = calculatedSubtotal + deliveryFee + codSurcharge;

  body.subtotal = calculatedSubtotal;
  body.delivery_fee = deliveryFee;
  body.total = total;

  return null;
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

    const validationError = validateOrderPrices(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data, error } = await insforgeInsert("orders", body);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (data) {
      sendOrderEmails(data as Record<string, any>).catch(() => {});
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
