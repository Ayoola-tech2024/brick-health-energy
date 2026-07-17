import { NextResponse } from "next/server";
import { insforgeSelect } from "@/lib/insforge-helpers";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = (await req.json()) as {
      code?: string;
      subtotal?: number;
    };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Discount code is required" }, { status: 400 });
    }

    const { data, error } = await insforgeSelect("discounts", {
      filters: { code: code.toUpperCase().trim() },
      limit: 1,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    const discount = Array.isArray(data) ? data[0] : null;
    if (!discount) {
      return NextResponse.json({ error: "Invalid discount code" }, { status: 404 });
    }

    if (!discount.active) {
      return NextResponse.json({ error: "This discount code is no longer active" }, { status: 400 });
    }

    const now = new Date();
    if (discount.starts_at && new Date(discount.starts_at) > now) {
      return NextResponse.json({ error: "This discount code is not yet valid" }, { status: 400 });
    }
    if (discount.ends_at && new Date(discount.ends_at) < now) {
      return NextResponse.json({ error: "This discount code has expired" }, { status: 400 });
    }

    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      return NextResponse.json({ error: "This discount code has reached its usage limit" }, { status: 400 });
    }

    if (discount.min_order && subtotal && subtotal < discount.min_order) {
      return NextResponse.json({
        error: `Minimum order amount of ₦${discount.min_order.toLocaleString()} required for this code`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = Math.round(((subtotal || 0) * discount.value) / 100);
    } else {
      discountAmount = discount.value;
    }

    return NextResponse.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discount_amount: discountAmount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
