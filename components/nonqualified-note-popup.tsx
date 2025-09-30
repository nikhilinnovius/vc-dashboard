"use client"

import { useState, useEffect } from "react"
import { RefreshCw, MessageSquare, Save, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { formatAffinityDate } from "@/lib/affinity-api"

interface NonQualifiedNotePopupProps {
  startup: {
    name: string
    website?: string
    companyScore?: string
    id?: string // Add id to startup object
  }
  isOpen: boolean
  onClose: () => void
}

export function NonQualifiedNotePopup({ startup, isOpen, onClose }: NonQualifiedNotePopupProps) {
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState("")
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(true) // Always show the add note form
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Determine if we should use KV or Affinity based on the score
  const useKV = startup.companyScore === "Score Unavailable"

  // Update the fetchNotes function to prioritize domain-based lookup
  const fetchNotes = async () => {
    if (!startup.website) {
      setNotes([])
      return
    }

    setIsLoading(true)
    try {
      if (useKV) {
        // Use KV for "Score Unavailable"
        const domain = startup.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
        const response = await fetch(`/api/notes/kv/${encodeURIComponent(domain)}`)

        if (response.ok) {
          const data = await response.json()
          setNotes(data.notes || [])
        } else {
          setNotes([])
        }
      } else {
        // Use Affinity for all other cases - ALWAYS prioritize domain-based lookup
        const domain = startup.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]

        // Always use domain parameter first, fall back to name only if necessary
        const response = await fetch(`/api/affinity/notes?domain=${encodeURIComponent(domain)}`)

        if (response.ok) {
          const data = await response.json()
          setNotes(data.notes || [])
        } else {
          // Only if domain lookup fails, try by name as fallback
          const nameResponse = await fetch(`/api/affinity/notes?name=${encodeURIComponent(startup.name)}`)

          if (nameResponse.ok) {
            const data = await nameResponse.json()
            setNotes(data.notes || [])
          } else {
            setNotes([])
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error)
      toast({
        title: "Error fetching notes",
        description: "Please try again later",
        variant: "destructive",
      })
      setNotes([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && startup.website) {
      fetchNotes()
    }
  }, [isOpen, startup.website])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchNotes()
    setIsRefreshing(false)
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsLoading(true)
    try {
      if (useKV) {
        // Add note to KV
        const domain = startup.website?.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
        const response = await fetch(`/api/notes/kv/${encodeURIComponent(domain || "")}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newNote }),
        })

        if (response.ok) {
          const newNoteData = await response.json()
          setNotes([newNoteData, ...notes])
          setNewNote("")

          // Auto-save the startup if this is the first note and it's using KV storage
          if (notes.length === 0 && startup.id) {
            try {
              // Call the API to save the startup
              const saveResponse = await fetch(`/api/nonqualified/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: startup.id }),
              })

              if (saveResponse.ok) {
                toast({
                  title: "Startup Saved",
                  description: "This startup has been added to your saved items",
                })
              }
            } catch (saveError) {
              console.error("Error auto-saving startup:", saveError)
              // Don't show error toast here as we already showed success for the note
            }
          }

          toast({ title: "Note added successfully" })
        } else {
          throw new Error("Failed to add note")
        }
      } else {
        // Add note to Affinity
        const domain = startup.website?.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
        const response = await fetch(`/api/affinity/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organization_id: notes[0]?.organization_id || null,
            content: newNote,
            domain,
            name: startup.name,
          }),
        })

        if (response.ok) {
          const newNoteData = await response.json()
          setNotes([newNoteData, ...notes])
          setNewNote("")
          toast({ title: "Note added successfully" })
        } else {
          throw new Error("Failed to add note")
        }
      }
    } catch (error) {
      console.error("Error adding note:", error)
      toast({ title: "Failed to add note", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateNote = async (noteId: number) => {
    if (!editContent.trim()) return

    setIsLoading(true)
    try {
      if (useKV) {
        // Update note in KV
        const domain = startup.website?.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
        const response = await fetch(`/api/notes/kv/${encodeURIComponent(domain || "")}/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        })

        if (response.ok) {
          const updatedNote = await response.json()
          setNotes(notes.map((note) => (note.id === noteId ? updatedNote : note)))
          setIsEditing(null)
          setEditContent("")
          toast({ title: "Note updated successfully" })
        } else {
          throw new Error("Failed to update note")
        }
      } else {
        // Update note in Affinity
        const response = await fetch(`/api/affinity/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        })

        if (response.ok) {
          const updatedNote = await response.json()
          setNotes(notes.map((note) => (note.id === noteId ? updatedNote : note)))
          setIsEditing(null)
          setEditContent("")
          toast({ title: "Note updated successfully" })
        } else {
          throw new Error("Failed to update note")
        }
      }
    } catch (error) {
      console.error("Error updating note:", error)
      toast({ title: "Failed to update note", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    setIsLoading(true)
    try {
      if (useKV) {
        // Delete note from KV
        const domain = startup.website?.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
        const response = await fetch(`/api/notes/kv/${encodeURIComponent(domain || "")}/${noteId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setNotes(notes.filter((note) => note.id !== noteId))
          toast({ title: "Note deleted successfully" })
        } else {
          throw new Error("Failed to delete note")
        }
      } else {
        // Delete note from Affinity
        const response = await fetch(`/api/affinity/notes/${noteId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setNotes(notes.filter((note) => note.id !== noteId))
          toast({ title: "Note deleted successfully" })
        } else {
          throw new Error("Failed to delete note")
        }
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({ title: "Failed to delete note", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (note: any) => {
    setIsEditing(note.id)
    setEditContent(note.content)
  }

  const cancelEditing = () => {
    setIsEditing(null)
    setEditContent("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col bg-[#0f172a] border-white/10 text-white p-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{startup.name} - Notes</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-transparent border-white/20 hover:bg-white/10 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <div className="flex items-center mt-2 text-white/70">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>{useKV ? "Local Notes" : "Affinity Notes"}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Note Section */}
          <div className="bg-[#1e293b] rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Add New Note</h3>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              className="min-h-[120px] bg-[#0f172a] border-white/10 text-white resize-none mb-3"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddNote}
                disabled={isLoading || !newNote.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </div>
          </div>

          {/* Notes List */}
          {isLoading && !notes.length ? (
            <div className="bg-[#1e293b] rounded-lg p-8 text-center text-white/70">
              <div className="animate-pulse">Loading notes...</div>
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-[#1e293b] rounded-lg p-8 text-center text-white/70 flex flex-col items-center">
              <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
              <p>No notes found for this organization.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-[#1e293b] rounded-lg p-4">
                  {isEditing === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px] bg-[#0f172a] border-white/10 text-white resize-none"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          onClick={cancelEditing}
                          variant="outline"
                          className="bg-transparent border-white/20 hover:bg-white/10 text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateNote(note.id)}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap mb-3">{note.content}</div>
                      <div className="flex items-center justify-between text-sm text-white/50">
                        <div>
                          {note.author || "Unknown"} • {formatAffinityDate(note.created_at)}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(note)}
                            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-white/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
