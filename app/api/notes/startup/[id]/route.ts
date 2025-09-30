import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const startupId = decodeURIComponent(params.id)

  try {
    const note = await kv.get(`user:${userId}:startup:${startupId}:note`)
    return NextResponse.json({ note })
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const startupId = decodeURIComponent(params.id)

  try {
    const { note } = await request.json()
    await kv.set(`user:${userId}:startup:${startupId}:note`, note)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving note:", error)
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const startupId = decodeURIComponent(params.id)

  try {
    await kv.del(`user:${userId}:startup:${startupId}:note`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
