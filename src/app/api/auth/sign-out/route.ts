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

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Sign out failed" },
      { status: 500 }
    );
  }
}
