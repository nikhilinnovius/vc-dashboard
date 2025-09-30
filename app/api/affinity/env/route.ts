import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if Affinity API key is set
    const apiKey = process.env.AFFINITY_API_KEY

    return NextResponse.json({
      hasAffinityKey: !!apiKey,
      message: apiKey ? "Affinity API key is configured" : "Affinity API key is not configured",
    })
  } catch (error) {
    console.error("Error checking Affinity API key:", error)
    return NextResponse.json(
      { error: "Failed to check Affinity API key", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
