/**
 * Server-side admin authorization for API route handlers.
 *
 * API routes in this app talk to InsForge with the SERVICE ROLE key, which
 * bypasses Row-Level Security. That means any caller reaching the route can
 * read all orders / modify products unless we explicitly verify the caller is
 * an admin HERE, on the server, using a real authenticated identity.
 *
 * Client-side `isAdminEmail()` checks in the admin pages are UX only and are
 * NOT a security boundary. Always pair a privileged mutation with
 * `requireAdmin()` (or `getServerAdminUser()`).
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";
import { isAdminEmail } from "./admin-auth";

/**
 * Resolve the currently authenticated user's email from the session cookie.
 * Returns null when there is no valid session.
 */
export async function getServerUserEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const client = createServerClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
      cookies: cookieStore as never,
    });

    const { data, error } = await client.auth.getCurrentUser();
    if (error || !data?.user) return null;

    const user = data.user as { email?: string; profile?: { email?: string } };
    const email = user.email ?? user.profile?.email ?? null;
    return email ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns the verified admin email when the caller is an authenticated admin,
 * otherwise null.
 */
export async function getServerAdminUser(): Promise<string | null> {
  const email = await getServerUserEmail();
  if (!email) return null;
  return isAdminEmail(email) ? email : null;
}

/**
 * Guard for admin-only API routes. Returns a JSON 401/403 response when the
 * caller is not an authenticated admin, or null when access is allowed.
 *
 * Usage:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const admin = await getServerAdminUser();
  if (!admin) {
    const email = await getServerUserEmail();
    return NextResponse.json(
      { error: email ? "Admin privileges required" : "Authentication required" },
      { status: email ? 403 : 401 }
    );
  }
  return null;
}
