import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    const auth = createAuthActions({
      requestCookies: request.cookies,
      responseCookies: response.cookies,
    });

    await auth.signOut();

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: response.headers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Sign out failed" },
      { status: 500 }
    );
  }
}
