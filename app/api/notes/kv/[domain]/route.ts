import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { kv } from "@vercel/kv"

// GET handler to fetch notes for a domain
export async function GET(request: Request, { params }: { params: { domain: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const domain = decodeURIComponent(params.domain)
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Get notes from KV
    const key = `notes:${domain.toLowerCase()}`
    const notes = (await kv.get(key)) || []

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error fetching KV notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

// POST handler to create a new note
export async function POST(request: Request, { params }: { params: { domain: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const domain = decodeURIComponent(params.domain)
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Get existing notes
    const key = `notes:${domain.toLowerCase()}`
    const existingNotes = (await kv.get(key)) || []

    // Create new note
    const newNote = {
      id: Date.now(),
      content,
      author: session.user.name || session.user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add new note to the beginning of the array
    const updatedNotes = [newNote, ...existingNotes]

    // Save to KV
    await kv.set(key, updatedNotes)

    return NextResponse.json(newNote)
  } catch (error) {
    console.error("Error creating KV note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
