import { NextResponse } from "next/server"
import { updateNote, deleteNote } from "@/lib/affinity-api"
import { getCurrentUser } from "@/lib/auth"
import { getEnvironment } from "@/middleware"

// PUT handler to update a note
export async function PUT(request: Request, { params }: { params: { noteId: string } }) {
  try {
    // Check authentication
    let environment = getEnvironment()
    let user = null

    if (environment === 'development') {
      user = {
        email: 'test@example.com',
        name: 'Test User'
      }
    } else {
      user = await getCurrentUser()
    }

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = Number.parseInt(params.noteId, 10)
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Update note in Affinity using the user's email for API key lookup
    const updatedNote = await updateNote(noteId, content, user.email)
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
export async function DELETE(request: Request, { params }: { params: { noteId: string } }) {
  try {
    // Check authentication
    let environment = getEnvironment()
    let user = null

    if (environment === 'development') {
      user = {
        email: 'test@example.com',
        name: 'Test User'
      }
    } else {
      user = await getCurrentUser()
    }

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = Number.parseInt(params.noteId, 10)
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    // Delete note in Affinity using the user's email for API key lookup
    const response = await deleteNote(noteId, user.email)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json(
      { error: "Failed to delete note", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
