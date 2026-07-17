import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    const auth = createAuthActions({
      requestCookies: request.cookies,
      responseCookies: response.cookies,
    });

    const { data, error } = await auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      return NextResponse.json(
        { error: error?.message || "Invalid email or password" },
        { status: 401 }
      );
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
