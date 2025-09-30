import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Force a fresh session check from the auth provider
    const session = await getServerSession(authOptions)

    // Log the session data for debugging
    console.log("Session API - Email verified status:", session?.user?.email_verified)

    // Ensure we return a valid object even if session is null
    const sessionData = session || null

    return NextResponse.json(sessionData, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching session:", error)
    // Return null instead of an error to prevent client-side issues
    return NextResponse.json(null, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    })
  }
}
