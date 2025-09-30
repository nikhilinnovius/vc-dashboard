import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { updateNote, deleteNote } from "@/lib/affinity-api"

// PUT handler to update a note
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = Number.parseInt(params.id, 10)
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Update note in Affinity using the user's email for API key lookup
    const updatedNote = await updateNote(noteId, content, session.user.email)
    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json(
      { error: "Failed to update note", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// DELETE handler to delete a note
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = Number.parseInt(params.id, 10)
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    // Delete note in Affinity using the user's email for API key lookup
    const response = await deleteNote(noteId, session.user.email)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json(
      { error: "Failed to delete note", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
