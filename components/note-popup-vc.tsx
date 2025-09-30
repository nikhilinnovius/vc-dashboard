"use client"

import { useState, useEffect } from "react"
import { Edit2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface NotePopupVCProps {
  itemId: string
  isOpen: boolean
  onClose: () => void
}

export function NotePopupVC({ itemId, isOpen, onClose }: NotePopupVCProps) {
  const [note, setNote] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchNote()
    }
  }, [isOpen, itemId])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/vc/${encodeURIComponent(itemId)}`)
      if (response.ok) {
        const data = await response.json()
        setNote(data.note || "")
        setIsEditing(!data.note)
      }
    } catch (error) {
      console.error("Failed to fetch note:", error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notes/vc/${encodeURIComponent(itemId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      })
      if (response.ok) {
        setIsEditing(false)
        toast({ title: "Note saved successfully" })
      } else {
        throw new Error("Failed to save note")
      }
    } catch (error) {
      console.error("Error saving note:", error)
      toast({ title: "Failed to save note", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notes/vc/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setNote("")
        setIsEditing(true)
        toast({ title: "Note deleted successfully" })
      } else {
        throw new Error("Failed to delete note")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({ title: "Failed to delete note", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Add Note"}</DialogTitle>
        </DialogHeader>
        {isEditing ? (
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter your note here..."
            className="min-h-[100px]"
          />
        ) : (
          <p className="whitespace-pre-wrap">{note}</p>
        )}
        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isLoading}>
                Save
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
