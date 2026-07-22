import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

export async function GET() {
  try {
    const client = createServerClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
      cookies: (await cookies()) as never,
    });

    const { data } = await client.auth.getCurrentUser();
    if (!data?.user) {
      return NextResponse.json({ data: { user: null } });
    }

    const profileData = await client.auth.getProfile(data.user.id);
    const enriched = {
      ...data.user,
      profile: profileData?.data ?? data.user.profile ?? null,
    };

    return NextResponse.json({ data: { user: enriched } });
  } catch {
    return NextResponse.json({ data: { user: null } });
  }
}
