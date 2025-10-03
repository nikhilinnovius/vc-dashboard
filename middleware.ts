import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { verifyToken } from "./lib/auth"
// Environment-based configuration
// Fallback to NODE_ENV if APP_ENV is not set
export const getEnvironment = () => {
  if (process.env.APP_ENV) {
    return process.env.APP_ENV
  }
  // Fallback to NODE_ENV (Vercel sets this automatically)
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV
  }
  // Final fallback to production for safety
  return 'production'
}

const environment = getEnvironment()
const isDevelopment = environment === 'development'

console.log(`[MIDDLEWARE] Environment: ${environment} (isDevelopment: ${isDevelopment})`)
console.log(`[MIDDLEWARE] APP_ENV: ${process.env.APP_ENV}`)
console.log(`[MIDDLEWARE] NODE_ENV: ${process.env.NODE_ENV}`)

const getLoginURL = (request: NextRequest) => {
  const callbackUrl = request.nextUrl.protocol + "//" + request.nextUrl.host + "/" + request.nextUrl.pathname + request.nextUrl.search
  console.log(`[MIDDLEWARE] Callback URL: ${callbackUrl}`)
  return `https://athena.innoviuscapital.com/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
}


/**
 * Unified middleware that handles both development and production authentication
 * - Development: Uses bypass authentication for easier testing
 * - Production: Uses JWT token-based authentication with external auth system
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  console.log(`[MIDDLEWARE] Processing request to: ${pathname} (${isDevelopment ? 'DEV' : 'PROD'} mode)`)

  // Development mode: Use bypass authentication
  if (isDevelopment) {
    return handleDevelopmentAuth(request)
  }

  // Production mode: Use JWT token authentication
  return handleProductionAuth(request)
}

/**
 * Development authentication handler
 * Provides hardcoded authentication for easier development
 */
async function handleDevelopmentAuth(request: NextRequest) {
  console.log("[MIDDLEWARE] Development auth handler called")
  const token = await getToken({ req: request })
  const isAuthenticated = true // Hardcoded for development

  // Get the pathname of the request
  const path = request.nextUrl.pathname
  const isApiPath = path.startsWith("/api/")
  const isAuthPath = path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/verify")

  // If the user is not authenticated and trying to access any route except auth routes or API routes
  if (!isAuthenticated && !isAuthPath && !isApiPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the user is authenticated and trying to access auth routes
  if (isAuthenticated && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Create response with custom headers for development bypass
  const response = NextResponse.next()
  
  // Set custom headers to bypass NextAuth session check
  response.headers.set('x-bypass-auth', 'true')
  response.headers.set('x-test-user', 'test@example.com')
  response.headers.set('x-test-user-name', 'Test User')
  
  // Also set cookies for easier client-side access
  response.cookies.set('bypass-auth', 'true', { 
    httpOnly: false, // Allow client-side access
    secure: false,   // For localhost
    sameSite: 'lax'
  })
  response.cookies.set('test-user-email', 'test@example.com', { 
    httpOnly: false,
    secure: false,
    sameSite: 'lax'
  })
  response.cookies.set('test-user-name', 'Test User', { 
    httpOnly: false,
    secure: false,
    sameSite: 'lax'
  })
  
  console.log("[MIDDLEWARE] Development bypass auth applied")
  return response
}

/**
 * Production authentication handler
 * Handles JWT token-based authentication with external auth system
 */
async function handleProductionAuth(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  console.log("[MIDDLEWARE] Production auth handler called")

  // Check for token in URL parameters
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

        // Delete the bypass-auth cookie, if one exists
        response.cookies.delete("bypass-auth")

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
        return NextResponse.redirect(getLoginURL(request))
      }
    } catch (error) {
      console.error("[MIDDLEWARE] Error during token verification:", error)
      return NextResponse.redirect(getLoginURL(request))
    }
  }

  // No token in URL - check for existing session
  const sessionCookie = request.cookies.get("auth-session")

  if (!sessionCookie?.value) {
    console.log("[MIDDLEWARE] No session found, redirecting to auth system")
    return NextResponse.redirect(getLoginURL(request))
  }

  try {
    // Validate existing session
    const userData = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (userData.exp && Date.now() >= userData.exp * 1000) {
      console.log("[MIDDLEWARE] Session expired, redirecting to auth system")

      // Session expired - clear cookie and redirect
      const response = NextResponse.redirect(getLoginURL(request))
      response.cookies.delete("bypass-auth")
      response.cookies.delete("auth-session")
      return response
    }

    console.log("[MIDDLEWARE] Valid session found for user:", userData.email)

    return NextResponse.next()
  } catch (error) {
    console.error("[MIDDLEWARE] Error parsing session cookie:", error)

    // Invalid session data - clear cookie and redirect
    const response = NextResponse.redirect(getLoginURL(request))
    response.cookies.delete("auth-session")
    return response
  }
}


// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. Most /api routes (but include specific ones that need auth)
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /favicon.ico, /manifest.json (static files)
     */
    "/((?!_next|_static|favicon.ico|manifest.json).*)",
    // Include specific API routes that need authentication
  ],
}
