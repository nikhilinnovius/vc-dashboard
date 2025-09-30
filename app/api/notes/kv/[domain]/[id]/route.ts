import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { kv } from "@vercel/kv"

// PUT handler to update a note
export async function PUT(request: Request, { params }: { params: { domain: string; id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const domain = decodeURIComponent(params.domain)
    const noteId = Number.parseInt(params.id, 10)

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Get existing notes
    const key = `notes:${domain.toLowerCase()}`
    const notes = (await kv.get(key)) || []

    // Find the note to update
    const noteIndex = notes.findIndex((note: any) => note.id === noteId)
    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Update the note
    const updatedNote = {
      ...notes[noteIndex],
      content,
      updated_at: new Date().toISOString(),
    }

    notes[noteIndex] = updatedNote

    // Save to KV
    await kv.set(key, notes)

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error updating KV note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

// DELETE handler to delete a note
export async function DELETE(request: Request, { params }: { params: { domain: string; id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const domain = decodeURIComponent(params.domain)
    const noteId = Number.parseInt(params.id, 10)

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    // Get existing notes
    const key = `notes:${domain.toLowerCase()}`
    const notes = (await kv.get(key)) || []

    // Filter out the note to delete
    const updatedNotes = notes.filter((note: any) => note.id !== noteId)

    // Save to KV
    await kv.set(key, updatedNotes)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting KV note:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
