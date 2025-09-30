import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const regularSavedStartups = await kv.smembers(`user:${userId}:saved_startups`)
    const nonQualifiedSavedStartups = await kv.smembers(`user:${userId}:saved_nonqualified_startups`)

    return NextResponse.json({
      regularSavedStartups,
      nonQualifiedSavedStartups,
      userId,
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ error: "Error fetching debug data" }, { status: 500 })
  }
}
