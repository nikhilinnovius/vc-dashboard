import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getCurrentUser } from "@/lib/auth"
import { getEnvironment } from "@/middleware"

export async function POST(request: Request) {
  let environment = getEnvironment()

  let userId = null
  if (environment !== 'development') {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    userId = user.id
  } else {
    userId = 'testuserid123##'
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Missing startup ID" }, { status: 400 })
    }

    await kv.sadd(`user:${userId}:saved_startups`, id)

    console.log(`Saved startup ${id} for user ${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving startup:", error)
    return NextResponse.json({ error: "Failed to save startup" }, { status: 500 })
  }
}
