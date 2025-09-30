import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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
    await kv.sadd(`user:${userId}:saved_startups`, id)

    console.log(`Saved startup ${id} for user ${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving startup:", error)
    return NextResponse.json({ error: "Failed to save startup" }, { status: 500 })
  }
}
