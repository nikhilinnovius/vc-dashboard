"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Edit2, Trash2, Save, X, RefreshCw, MessageSquare } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatAffinityDate } from "@/lib/affinity-api"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AffinityNote {
  id: number
  content: string
  created_at: string
  creator_id: number
  author: string
}

interface AffinityNotesProps {
  domain: string
  name?: string
}

export function AffinityNotes({ domain, name }: AffinityNotesProps) {
  const [notes, setNotes] = useState<AffinityNote[]>([])
  const [organizationId, setOrganizationId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch notes on component mount and when domain changes
  useEffect(() => {
    if (domain || name) {
      fetchNotes()
    }
  }, [domain, name])

  // Update the fetchNotes function to add better error handling and debugging
  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build the query string with both domain and name if available
      const queryParams = new URLSearchParams()

      if (name) {
        queryParams.append("name", name)
        console.log(`Using name for lookup: ${name}`)
      }

      if (domain) {
        // Ensure domain is clean before sending to API
        const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/i, "").split("/")[0]
        queryParams.append("domain", cleanDomain)
        console.log(`Using domain for lookup: ${cleanDomain}`)
      }

      console.log(`Fetching notes with params: ${queryParams.toString()}`)
      const response = await fetch(`/api/affinity/notes?${queryParams.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch notes")
      }

      const data = await response.json()
      console.log("Notes fetched successfully:", data)

      // Ensure each note has an author property
      const processedNotes = (data.notes || []).map((note) => ({
        ...note,
        author: note.author || note.creator_name || "Unknown",
      }))

      setNotes(processedNotes)
      setOrganizationId(data.organization_id)
    } catch (err) {
      console.error("Error fetching notes:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching notes")
      toast({
        title: "Error",
        description: "Failed to fetch notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = async () => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization not found. Cannot create note.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)

      const response = await fetch("/api/affinity/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_id: organizationId,
          content: noteContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create note")
      }

      const newNote = await response.json()

      // Add the new note to the list
      setNotes((prevNotes) => [newNote, ...prevNotes])
      setNoteContent("")
      setIsCreating(false)

      toast({
        title: "Success",
        description: "Note created successfully",
      })
    } catch (err) {
      console.error("Error creating note:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create note",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateNote = async (noteId: number) => {
    try {
      const response = await fetch(`/api/affinity/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: noteContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update note")
      }

      const updatedNote = await response.json()

      // Update the note in the list
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? { ...note, content: updatedNote.content } : note)),
      )

      setIsEditing(null)
      setNoteContent("")

      toast({
        title: "Success",
        description: "Note updated successfully",
      })
    } catch (err) {
      console.error("Error updating note:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update note",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`/api/affinity/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete note")
      }

      // Remove the note from the list
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId))
      setShowDeleteDialog(null)

      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting note:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const startEditing = (note: AffinityNote) => {
    setIsEditing(note.id)
    setNoteContent(note.content)
  }

  const cancelEditing = () => {
    setIsEditing(null)
    setNoteContent("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Affinity Notes
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchNotes}
          disabled={isLoading}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Create new note section */}
      <div className="bg-[#1f3b1d]/70 rounded-lg p-4 border border-white/10">
        <h4 className="text-sm font-medium text-white mb-2">Add New Note</h4>
        <Textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Enter your note here..."
          className="min-h-[100px] bg-white/10 text-white border-white/20 focus:border-white/40 mb-3"
          disabled={isCreating || isEditing !== null}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleCreateNote}
            disabled={!noteContent || isCreating || isEditing !== null}
            className="bg-[#3ea04d] hover:bg-[#3ea04d]/80 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-white">
          <p className="font-medium">Error loading notes</p>
          <p className="text-sm opacity-80">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotes}
            className="mt-2 bg-white/10 hover:bg-white/20 text-white"
          >
            Try Again
          </Button>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white/5 rounded-lg p-6 text-center text-white/70">
          <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No notes found for this organization.</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                {isEditing === note.id ? (
                  <>
                    <Textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="min-h-[100px] bg-white/10 text-white border-white/20 focus:border-white/40 mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={!noteContent}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Update
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{note.author || "Unknown"}</p>
                        <p className="text-xs text-white/60">{formatAffinityDate(note.created_at)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(note)}
                          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowDeleteDialog(note.id)}
                          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-white whitespace-pre-wrap">{note.content}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note from Affinity. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDeleteNote(showDeleteDialog)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
