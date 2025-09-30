import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const savedVCs = await kv.smembers(`user:${userId}:saved_vcs`)

  return NextResponse.json({ savedVCs })
}
