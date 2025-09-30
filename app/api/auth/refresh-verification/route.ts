import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getToken } from "next-auth/jwt"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Get the current session and token
    const session = await getServerSession(authOptions)
    const token = await getToken({ req: request as any })

    if (!session || !token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user info directly from Auth0 to check verification status
    const userId = token.sub
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 })
    }

    // Fetch user profile directly from Auth0 Management API
    const auth0Domain = process.env.AUTH0_ISSUER?.replace("https://", "")
    const auth0ManagementToken = await getAuth0ManagementToken()

    if (!auth0ManagementToken) {
      return NextResponse.json(
        {
          error: "Could not get Auth0 management token",
          session: session,
          token: { ...token, sub: token.sub },
        },
        { status: 500 },
      )
    }

    // Get user profile from Auth0
    const userResponse = await fetch(`https://${auth0Domain}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${auth0ManagementToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch user profile from Auth0",
          status: userResponse.status,
          statusText: userResponse.statusText,
        },
        { status: 500 },
      )
    }

    const userData = await userResponse.json()

    // Return the verification status from Auth0
    return NextResponse.json({
      email: userData.email,
      email_verified: userData.email_verified,
      auth0_verification_status: userData.email_verified,
      session_verification_status: session.user?.email_verified,
      user_id: userId,
    })
  } catch (error) {
    console.error("Error refreshing verification status:", error)
    return NextResponse.json(
      {
        error: "Failed to refresh verification status",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Helper function to get Auth0 Management API token
async function getAuth0ManagementToken() {
  try {
    const auth0Domain = process.env.AUTH0_ISSUER?.replace("https://", "")
    const response = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${auth0Domain}/api/v2/`,
        grant_type: "client_credentials",
      }),
    })

    if (!response.ok) {
      console.error("Failed to get Auth0 management token:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error getting Auth0 management token:", error)
    return null
  }
}
