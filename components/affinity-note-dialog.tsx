"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface AffinityNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  domain: string
  name: string
}

export function AffinityNoteDialog({ isOpen, onClose, domain, name }: AffinityNoteDialogProps) {
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Reset note when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNote("")
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast({
        title: "Note cannot be empty",
        description: "Please enter a note before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/affinity/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          content: note,
          name,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save note to Affinity")
      }

      const data = await response.json()

      toast({
        title: "Note saved to Affinity",
        description: "Your note has been successfully saved to Affinity.",
      })

      onClose()
    } catch (error) {
      console.error("Error saving note to Affinity:", error)
      toast({
        title: "Error saving note",
        description: "There was an error saving your note to Affinity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note to Affinity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Company: {name}</p>
            <p className="text-sm text-muted-foreground">Domain: {domain}</p>
          </div>
          <Textarea
            placeholder="Enter your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save to Affinity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
