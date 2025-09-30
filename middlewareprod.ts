import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

// Auth system URL - where users should be redirected for authentication
const AUTH_SYSTEM_URL = "https://athena.innoviuscapital.com/vc-dashboard-new" //TODO: change to VC-dashboard on migration

/**
 * Middleware to handle JWT token-based authentication
 * Checks for tokens in URL parameters and validates them using the verifyToken function from auth.ts
 * Sets HTTP-only cookies for authenticated sessions
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  console.log(`[MIDDLEWARE] Processing request to: ${pathname}`)

  // Check for token in URL parameters FIRST
  const token = searchParams.get("token")

  if (token) {
    console.log("[MIDDLEWARE] Token found in URL, attempting verification...")

    try {
      // Verify the JWT token
      const user = await verifyToken(token)

      if (user) {
        console.log("[MIDDLEWARE] Token verified successfully for user:", user.email)

        // Redirect to clean URL (remove token parameter) with cookie set
        const cleanUrl = new URL(request.url)
        cleanUrl.searchParams.delete("token")
        
        const response = NextResponse.redirect(cleanUrl.toString())

        // Set the session cookie
        const expiresAt = user.exp ? new Date(user.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const sessionData = JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          exp: user.exp,
        })

        response.cookies.set("auth-session", sessionData, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: expiresAt,
          sameSite: "strict",
          path: "/",
        })

        console.log("[MIDDLEWARE] Redirecting to clean URL:", cleanUrl.toString())
        return response
      } else {
        console.error("[MIDDLEWARE] Token verification failed, redirecting to auth system")
        return NextResponse.redirect(AUTH_SYSTEM_URL)
      }
    } catch (error) {
      console.error("[MIDDLEWARE] Error during token verification:", error)
      return NextResponse.redirect(AUTH_SYSTEM_URL)
    }
  }

  // No token in URL - check for existing session
  const sessionCookie = request.cookies.get("auth-session")

  if (!sessionCookie?.value) {
    console.log("[MIDDLEWARE] No session found, redirecting to auth system")
    return NextResponse.redirect(AUTH_SYSTEM_URL)
  }

  try {
    // Validate existing session
    const userData = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (userData.exp && Date.now() >= userData.exp * 1000) {
      console.log("[MIDDLEWARE] Session expired, redirecting to auth system")

      // Session expired - clear cookie and redirect
      const response = NextResponse.redirect(AUTH_SYSTEM_URL)
      response.cookies.delete("auth-session")
      return response
    }

    // Valid session - continue
    console.log("[MIDDLEWARE] Valid session found for user:", userData.email)
    return NextResponse.next()
  } catch (error) {
    console.error("[MIDDLEWARE] Error parsing session cookie:", error)

    // Invalid session data - clear cookie and redirect
    const response = NextResponse.redirect(AUTH_SYSTEM_URL)
    response.cookies.delete("auth-session")
    return response
  }
}

/**
 * Middleware configuration - CRITICAL: Only run on pages, not API routes or static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (.png, .jpg, .css, .js, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // Exclude files with extensions to prevent middleware on assets
    "/((?!.*\\.).*)"
  ],
}