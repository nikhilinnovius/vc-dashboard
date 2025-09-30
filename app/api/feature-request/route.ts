import { kv } from "@vercel/kv"
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all feature requests from KV storage
    const featureRequests = (await kv.hgetall("feature-requests")) || {}

    // Convert to array
    const requestsArray = Object.entries(featureRequests).map(([id, data]) => ({
      id,
      ...(data as any),
    }))

    return NextResponse.json(
      {
        requests: requestsArray,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching feature requests:", error)
    return NextResponse.json({ error: "Failed to fetch feature requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.featureName || !data.userName || !data.userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique ID
    const id = `fr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Add timestamp
    const featureRequest = {
      ...data,
      timestamp: new Date().toISOString(),
      status: "new",
    }

    // Store in KV
    await kv.hset("feature-requests", { [id]: featureRequest })

    return NextResponse.json({
      success: true,
      id,
      message: "Feature request submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting feature request:", error)
    return NextResponse.json({ error: "Failed to submit feature request" }, { status: 500 })
  }
}
