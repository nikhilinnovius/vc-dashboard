import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = true

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

  // Create response with custom header for hardcoded auth
  const response = NextResponse.next()
  
  // Set custom headers to bypass NextAuth session check
  response.headers.set('x-bypass-auth', 'true')
  response.headers.set('x-test-user', 'test@example.com')
  response.headers.set('x-test-user-name', 'Test User')
  
  // Also set a cookie for easier client-side access
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
  
  return response
}

/**
 * Middleware configuration - CRITICAL: Only run on pages, not API routes or static files
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/((?!.*\\.).*)",
  ],
}


