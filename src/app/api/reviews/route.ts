import { NextResponse } from "next/server";
import { insforgeSelect, insforgeInsert } from "@/lib/insforge-helpers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    const { data, error } = await insforgeSelect("product_reviews", {
      filters: { product_id: productId },
      order: "created_at",
      ascending: false,
      limit: 50,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_id, user_id, user_name, rating, title, comment } = body;

    if (!product_id || !user_name || !rating) {
      return NextResponse.json(
        { error: "product_id, user_name, and rating are required" },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const { data, error } = await insforgeInsert("product_reviews", {
      product_id,
      user_id: user_id || null,
      user_name,
      rating: ratingNum,
      title: title || null,
      comment: comment || null,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
