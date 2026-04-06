import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEV_MODE = !process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY === "";

export default async function middleware(req: NextRequest) {
  // Skip Clerk in local dev when no keys configured
  if (DEV_MODE) {
    return NextResponse.next();
  }

  // Production: use Clerk
  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/editor(.*)",
  ]);

  return clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request)) {
      await auth.protect();
    }
  })(req, {} as any);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
