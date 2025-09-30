"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  itemId: string
  itemType: "vc" | "startup" | "nonqualified"
  initialSaved: boolean
  onSaveChange?: (saved: boolean) => void
  className?: string
}

export function SaveButton({ itemId, itemType, initialSaved, onSaveChange, className }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const { toast } = useToast()

  useEffect(() => {
    setIsSaved(initialSaved)
  }, [initialSaved])

  const handleSaveAction = useCallback(
    async (shouldSave: boolean) => {
      const endpoint =
        itemType === "nonqualified"
          ? `/api/nonqualified/${shouldSave ? "save" : "unsave"}`
          : `/api/${itemType}s/${shouldSave ? "save" : "unsave"}`

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: itemId }),
        })
        if (response.ok) {
          setIsSaved(shouldSave)
          // FIXED: Only call onSaveChange once with the boolean value
          onSaveChange?.(shouldSave)
          return true
        } else {
          throw new Error("Failed to save")
        }
      } catch (error) {
        console.error("Error in save action:", error)
        return false
      }
    },
    [itemId, itemType, onSaveChange],
  )

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newSavedState = !isSaved

    // Update local state immediately for responsive UI
    setIsSaved(newSavedState)

    try {
      const endpoint =
        itemType === "nonqualified"
          ? `/api/nonqualified/${newSavedState ? "save" : "unsave"}`
          : `/api/${itemType}s/${newSavedState ? "save" : "unsave"}`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${newSavedState ? "save" : "unsave"} the ${itemType}`)
      }

      // FIXED: Only call onSaveChange once here, not twice
      onSaveChange?.(newSavedState)

      toast({
        title: `${itemId} ${newSavedState ? "Saved" : "Unsaved"}`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleSaveAction(!newSavedState)
              toast({
                title: `Undo successful`,
                description: `${itemId} ${!newSavedState ? "saved" : "unsaved"} again.`,
              })
            }}
          >
            Undo
          </Button>
        ),
      })
    } catch (error) {
      // Revert the local state if there was an error
      setIsSaved(!newSavedState)
      console.error("Error in save action:", error)

      toast({
        title: "Error",
        description: `Failed to ${newSavedState ? "save" : "unsave"} the ${itemType}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSave}
      aria-label={isSaved ? `Unsave ${itemType}` : `Save ${itemType}`}
      className={cn(`transition-colors ${isSaved ? "text-blue-500" : "text-gray-500 hover:text-gray-700"}`, className)}
    >
      <Bookmark className={`h-5 w-5 transition-all ${isSaved ? "fill-current" : ""}`} />
    </Button>
  )
}
