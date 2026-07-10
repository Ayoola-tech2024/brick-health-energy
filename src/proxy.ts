import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  try {
    await updateSession({
      requestCookies: request.cookies as any,
      responseCookies: response.cookies as any,
    });
  } catch (error) {
    console.error("Proxy updateSession error:", error);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
