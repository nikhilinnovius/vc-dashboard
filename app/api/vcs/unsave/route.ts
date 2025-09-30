import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "VC ID is required" }, { status: 400 })
  }

  const userId = session.user.id
  await kv.srem(`user:${userId}:saved_vcs`, id)

  return NextResponse.json({ success: true })
}
