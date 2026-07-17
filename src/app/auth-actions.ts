"use server";

import { cookies } from "next/headers";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email"));

  if (!email) {
    return { error: "Please enter your email address" };
  }

  // Use the InsForge REST API directly for password reset
  const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL ?? "";
  const serviceKey = process.env.INSFORGE_SERVICE_ROLE_KEY ?? "";

  if (!insforgeUrl || !serviceKey) {
    return { error: "Authentication service is not configured" };
  }

  try {
    const response = await fetch(
      `${insforgeUrl.replace(/\/$/, "")}/api/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          email,
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login`,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return { error: `Failed to send reset email: ${text}` };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to send reset email. Please try again later." };
  }
}

export async function signInWithGoogleAction(redirectTo: string) {
  try {
    const cookieStore = await cookies();
    const auth = createAuthActions({ cookies: cookieStore });
    const origin = (() => {
      try { return new URL(redirectTo).origin; }
      catch { return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; }
    })();
    const { data, error } = await auth.signInWithOAuth("google", {
      redirectTo: `${origin}/api/auth/callback`,
      skipBrowserRedirect: true,
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.codeVerifier) {
      cookieStore.set("insforge_code_verifier", data.codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      });
    }

    return { url: data?.url ?? null };
  } catch (err: any) {
    return { error: err.message || "Failed to initialize Google login" };
  }
}

export async function getUserProfileAction(userId: string) {
  try {
    const { insforgeSelect } = await import("@/lib/insforge-helpers");
    const { data, error } = await insforgeSelect("users", {
      filters: { id: userId },
      limit: 1,
    });
    if (error) {
      return { error };
    }
    return { profile: data?.[0] ?? null };
  } catch (err: any) {
    return { error: err.message || "Failed to fetch profile" };
  }
}

export async function updateUserProfileAction(userId: string, profile: {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}) {
  try {
    const { insforgeUpdate } = await import("@/lib/insforge-helpers");
    const { data, error } = await insforgeUpdate("users", { id: userId }, profile);
    if (error) {
      return { error };
    }
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message || "Failed to update profile" };
  }
}

