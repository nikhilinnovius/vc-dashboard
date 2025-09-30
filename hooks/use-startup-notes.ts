import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function useStartupNotes(startupIdentifier: string) {
  const [note, setNote] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/startup/${encodeURIComponent(startupIdentifier)}`)
        if (response.ok) {
          const data = await response.json()
          setNote(data.note || "")
        }
      } catch (error) {
        console.error("Failed to fetch note:", error)
      }
    }

    if (startupIdentifier) {
      fetchNote()
    }
  }, [startupIdentifier])

  const saveNote = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notes/startup/${encodeURIComponent(startupIdentifier)}`, {
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

  const deleteNote = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notes/startup/${encodeURIComponent(startupIdentifier)}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setNote("")
        setIsEditing(false)
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

  return {
    note,
    setNote,
    isEditing,
    setIsEditing,
    isLoading,
    saveNote,
    deleteNote,
  }
}

