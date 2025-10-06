"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  useEffect(() => {
    setIsSaved(initialSaved)
  }, [initialSaved])

  // Network requests are handled by parent components via onSaveChange

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newSavedState = !isSaved

    // Update local state immediately for responsive UI
    setIsSaved(newSavedState)

    // Delegate network to parent (e.g., GridView via VCCard/StartupCard)
    onSaveChange?.(newSavedState)
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
