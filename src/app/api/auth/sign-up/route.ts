import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name required" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    const auth = createAuthActions({
      requestCookies: request.cookies,
      responseCookies: response.cookies,
    });

    const { data, error } = await auth.signUp({ email, password, name });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: response.headers }
      );
    }

    // Auto-sign-in immediately so the user has a session
    await auth.signInWithPassword({ email, password });

    const json = JSON.stringify({ user: data?.user ?? null, success: true });
    return new NextResponse(json, {
      status: 200,
      headers: response.headers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
