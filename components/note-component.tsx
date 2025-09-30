"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
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

interface NoteComponentProps {
  itemId: string
  itemType: "vc" | "startup"
}

export function NoteComponent({ itemId, itemType }: NoteComponentProps) {
  const [note, setNote] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedNote, setEditedNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchNote()
  }, []) // Only itemId is needed here

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${itemType}/${encodeURIComponent(itemId)}`)
      if (response.ok) {
        const data = await response.json()
        setNote(data.note || "")
      }
    } catch (error) {
      console.error("Failed to fetch note:", error)
    }
  }

  const handleAddNote = () => {
    setEditedNote("")
    setIsEditing(true)
  }

  const handleEditNote = () => {
    setEditedNote(note)
    setIsEditing(true)
  }

  const handleSaveNote = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notes/${itemType}/${encodeURIComponent(itemId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: editedNote }),
      })

      if (response.ok) {
        setNote(editedNote)
        setIsEditing(false)
        toast({
          title: "Note saved",
          description: "Your note has been saved successfully.",
        })
      } else {
        throw new Error("Failed to save note")
      }
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notes/${itemType}/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNote("")
        setShowDeleteDialog(false)
        toast({
          title: "Note deleted",
          description: "Your note has been deleted successfully.",
        })
      } else {
        throw new Error("Failed to delete note")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedNote("")
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">Notes</h3>
        {note && !isEditing && (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={handleEditNote} className="text-white hover:bg-white/10">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-white hover:bg-white/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            placeholder={`Add your notes about this ${itemType}...`}
            className="min-h-[120px] bg-white/10 text-white placeholder:text-white/50"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNote}
              disabled={isLoading}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : note ? (
        <div className="rounded-md bg-white/10 p-4 text-white/90">
          <p className="whitespace-pre-wrap">{note}</p>
        </div>
      ) : (
        <Button variant="outline" onClick={handleAddNote} className="w-full bg-white/10 text-white hover:bg-white/20">
          <Edit className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your note. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
