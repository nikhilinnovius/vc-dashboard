import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { bulkStoreUserApiKeys } from "@/lib/user-api-keys"

// POST handler to store multiple user API keys
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admin users to set API keys
    // You may want to add additional checks here to verify the user is an admin

    const body = await request.json()
    const { users } = body

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Invalid users data" }, { status: 400 })
    }

    // Validate each user object
    for (const user of users) {
      if (!user.email || !user.name || !user.affinityApiKey) {
        return NextResponse.json(
          {
            error: "Each user must have email, name, and affinityApiKey fields",
          },
          { status: 400 },
        )
      }
    }

    // Store the user API keys
    const result = await bulkStoreUserApiKeys(users)

    return NextResponse.json({
      success: result.success,
      message: `Successfully stored ${result.successCount} user API keys. Failed: ${result.failedCount}.`,
    })
  } catch (error) {
    console.error("Error storing user API keys:", error)
    return NextResponse.json(
      { error: "Failed to store user API keys", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// GET handler to check if the endpoint is working
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admin users
    // You may want to add additional checks here

    return NextResponse.json({
      message: "User API keys endpoint is working. Use POST to store user API keys.",
    })
  } catch (error) {
    console.error("Error in API keys endpoint:", error)
    return NextResponse.json(
      { error: "Endpoint error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
