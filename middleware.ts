import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log(
    JSON.stringify({
      type: "request",
      method: request.method,
      path: request.nextUrl.pathname,
      time: new Date().toISOString()
    })
  );
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
