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
    const savedStartups = (await kv.smembers(`user:${userId}:saved_startups`)) || []

    return NextResponse.json({ savedStartups })
  } catch (error) {
    console.error("Error fetching saved startups:", error)
    return NextResponse.json({ error: "Failed to fetch saved startups" }, { status: 500 })
  }
}
