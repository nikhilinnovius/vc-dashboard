import { kv } from "@vercel/kv"
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "Feature request ID is required" }, { status: 400 })
    }

    // Get all feature requests
    const allRequests = (await kv.hgetall("feature-requests")) || {}

    // Check if the request exists
    if (!allRequests[id]) {
      return NextResponse.json({ error: "Feature request not found" }, { status: 404 })
    }

    // Delete the feature request from KV storage
    await kv.hdel("feature-requests", id)

    // Verify deletion was successful
    const checkDeleted = await kv.hexists("feature-requests", id)
    if (checkDeleted) {
      throw new Error("Failed to delete feature request from KV storage")
    }

    return NextResponse.json({ success: true, message: "Feature request deleted successfully" })
  } catch (error) {
    console.error("Error deleting feature request:", error)
    return NextResponse.json(
      { error: "Failed to delete feature request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
