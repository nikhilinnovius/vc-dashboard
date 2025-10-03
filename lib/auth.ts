import "server-only"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import type { AuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"

// User type definition
export interface User {
  id: string
  email: string
  name?: string
  role?: string
  exp?: number
}

// JWT payload interface
interface JWTPayload {
  sub: string // user ID
  email: string
  name?: string
  role?: string
  exp: number
  iat: number
}

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
if (!JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY environment variable is required")
}

const encodedKey = new TextEncoder().encode(JWT_SECRET_KEY)

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded user payload or null if invalid
 */
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    })

    const jwtPayload = payload as unknown as JWTPayload

    // Validate required fields
    if (!jwtPayload.sub || !jwtPayload.email) {
      console.error("JWT token missing required fields (sub, email)")
      return null
    }

    // Check if token is expired
    if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
      console.error("JWT token has expired")
      return null
    }

    return {
      id: jwtPayload.sub,
      email: jwtPayload.email,
      name: jwtPayload.name,
      role: jwtPayload.role,
      exp: jwtPayload.exp,
    }
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

/**
 * Create a session cookie with user information
 * @param user - User object to store in cookie
 */
export async function createSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  const expiresAt = user.exp ? new Date(user.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default

  // Create a simple session token (not a JWT, just user data)
  const sessionData = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: user.exp,
  })

  cookieStore.set("auth-session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  })
}

/**
 * Get current authenticated user from session cookie
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("auth-session")

    if (!sessionCookie?.value) {
      return null
    }

    const userData = JSON.parse(sessionCookie.value) as User

    // Validate required fields
    if (!userData.id || !userData.email) {
      console.error("Invalid session data: missing required fields")
      await deleteSession()
      return null
    }

    // Check if session is expired
    if (userData.exp && Date.now() >= userData.exp * 1000) {
      console.error("Session has expired")
      await deleteSession()
      return null
    }

    console.log("[getCurrentUser] Session found for user:", userData.email)

    return userData
  } catch (error) {
    console.error("Failed to parse session cookie:", error)
    await deleteSession()
    return null
  }
}

/**
 * Delete the current session cookie
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("auth-session")
}

/**
 * Check if user is authenticated
 * @returns boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Get user display name with fallback
 * @param user - User object
 * @returns Display name string
 */
export function getUserDisplayName(user: User): string {
  if (user.name && user.name.trim()) {
    return user.name.trim()
  }
  if (user.email) {
    return user.email
  }
  return "Authenticated User"
}

// NextAuth.js configuration for API routes that need it
export const authOptions: AuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER,
      authorization: { params: { prompt: "login" } },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}
