import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getCurrentUser } from "@/lib/auth"
import { getEnvironment } from "@/middleware"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log("Saving Startup")

  let userId = null
  let environment = getEnvironment()

  if (environment === 'development') {
    userId = 'testuserid123##'
  } else {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    userId = user.id
  }

  const startupId = decodeURIComponent(params.id)
  if (!startupId) {
    return NextResponse.json({ error: "Startup ID is required" }, { status: 400 })
  }

  await kv.sadd(`user:${userId}:saved_startups`, startupId)

  return NextResponse.json({ success: true })
}
