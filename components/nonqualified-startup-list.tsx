"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import type { NonQualifiedStartupData } from "@/lib/data-utils"
import { NonQualifiedStartupCard } from "@/components/nonqualified-startup-card"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface NonQualifiedStartupListProps {
  vcId: string | null
  nonQualifiedStartups: NonQualifiedStartupData[]
  isLoading?: boolean
  highlightedStartupId?: string | null
  onHighlightStartup?: (id: string | null) => void
}

export function NonQualifiedStartupList({
  vcId,
  nonQualifiedStartups,
  isLoading = false,
  highlightedStartupId = null,
  onHighlightStartup,
}: NonQualifiedStartupListProps) {
  const [savedStartups, setSavedStartups] = useState<string[]>([])
  const { toast } = useToast()

  // Fetch saved startups on component mount
  useEffect(() => {
    let isMounted = true // Add a flag to prevent state updates on unmounted components

    const fetchSavedStartups = async () => {
      try {
        const response = await fetch("/api/nonqualified/saved")
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.savedStartups) && isMounted) {
            setSavedStartups(data.savedStartups)
            console.log("Fetched saved non-qualified startups for display:", data.savedStartups)
          }
        }
      } catch (error) {
        console.error("Error fetching saved non-qualified startups:", error)
      }
    }

    if (vcId) {
      // Only fetch if vcId is available
      fetchSavedStartups()
    }

    return () => {
      isMounted = false // Set the flag to false when the component unmounts
    }
  }, [vcId]) // Add vcId as a dependency

  const handleSaveChange = async (startupId: string, saved: boolean) => {
    // Log the action for debugging
    console.log(`${saved ? "Saving" : "Unsaving"} non-qualified startup:`, startupId)

    // Update local state for immediate UI feedback
    setSavedStartups((prevSavedStartups) => {
      if (saved) {
        return [...new Set([...prevSavedStartups, startupId])]
      } else {
        return prevSavedStartups.filter((id) => id !== startupId)
      }
    })

    // Call the API to save/unsave the startup
    const endpoint = `/api/nonqualified/${saved ? "save" : "unsave"}`
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: startupId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${saved ? "save" : "unsave"} startup`)
      }

      console.log(`Successfully ${saved ? "saved" : "unsaved"} startup:`, startupId)

      // Show success toast
      toast({
        title: `${saved ? "Saved" : "Unsaved"} startup`,
        description: saved ? "Startup added to saved items" : "Startup removed from saved items",
        action: saved ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleSaveChange(startupId, false)
            }}
          >
            Undo
          </Button>
        ) : undefined,
      })
    } catch (error) {
      console.error(`Error ${saved ? "saving" : "unsaving"} startup:`, error)
      // Revert the local state change if the API call failed
      setSavedStartups((prevSavedStartups) => {
        if (saved) {
          return prevSavedStartups.filter((id) => id !== startupId)
        } else {
          return [...new Set([...prevSavedStartups, startupId])]
        }
      })

      // Show error toast
      toast({
        title: "Error",
        description: `Failed to ${saved ? "save" : "unsave"} startup. Please try again.`,
        variant: "destructive",
      })
    }
  }

  // Filter startups for this VC
  const filteredStartups = nonQualifiedStartups.filter((startup) => startup.vcId === vcId)

  // Log some of the startups for this VC to verify ID format
  useEffect(() => {
    if (filteredStartups.length > 0) {
      console.log(
        "Sample non-qualified startup IDs for current VC:",
        filteredStartups.slice(0, 3).map((s) => s.id),
      )
    }
  }, [filteredStartups])

  if (!vcId) return null

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
        <p className="text-white text-xl">Loading remaining portfolio...</p>
      </div>
    )
  }

  if (filteredStartups.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        Remaining Portfolio
        <span className="ml-2 text-base font-normal text-white/60">
          {filteredStartups.length} {filteredStartups.length === 1 ? "startup" : "startups"}
        </span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 auto-rows-fr">
        {filteredStartups.map((startup, index) => (
          <motion.div
            key={startup.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(0.03 * index, 0.15) }}
            className="h-full"
          >
            <NonQualifiedStartupCard
              startup={startup}
              isHighlighted={highlightedStartupId === startup.id}
              isSaved={savedStartups.includes(startup.id)}
              onSaveChange={handleSaveChange}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
