"use server";

import { cookies } from "next/headers";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  if (!email || !password) {
    return { error: "Please fill in all fields" };
  }

  try {
    const auth = createAuthActions({ cookies: await cookies() });
    const { data, error } = await auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { user: data?.user ?? null, success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const name = String(formData.get("name"));

  if (!email || !password || !name) {
    return { error: "Please fill in all fields" };
  }

  try {
    const auth = createAuthActions({ cookies: await cookies() });
    const { data, error } = await auth.signUp({
      email,
      password,
      name,
    });

    if (error) {
      return { error: error.message };
    }

    return { user: data?.user ?? null, success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function signOutAction() {
  try {
    const auth = createAuthActions({ cookies: await cookies() });
    const { error } = await auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function signInWithGoogleAction(redirectTo: string) {
  try {
    const auth = createAuthActions({ cookies: await cookies() });
    const { data, error } = await auth.signInWithOAuth("google", {
      redirectTo,
      skipBrowserRedirect: true,
    });

    if (error) {
      return { error: error.message };
    }

    return { url: data?.url ?? null };
  } catch (err: any) {
    return { error: err.message || "Failed to initialize Google login" };
  }
}
