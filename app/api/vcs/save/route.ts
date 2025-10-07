import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getCurrentUser } from "@/lib/auth"
import { getEnvironment } from "@/middleware"

export async function POST(request: Request) {
  console.log("Saving VC")

  let userId = null
  let environment = getEnvironment()

  if (environment !== 'development') {
    userId = 'testuserid123##'
  } else {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    userId = user.id
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "VC ID is required" }, { status: 400 })
  }

  await kv.sadd(`user:${userId}:saved_vcs`, id)

  return NextResponse.json({ success: true })
}
