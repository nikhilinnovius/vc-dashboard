import { kv } from "@vercel/kv"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Missing startup ID" }, { status: 400 })
    }

    const userId = session.user.id
    await kv.srem(`user:${userId}:saved_startups`, id)

    console.log(`Unsaved startup ${id} for user ${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unsaving startup:", error)
    return NextResponse.json({ error: "Failed to unsave startup" }, { status: 500 })
  }
}
