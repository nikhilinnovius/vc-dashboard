"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import type { NonQualifiedStartupData } from "@/lib/data-utils"
import { NonQualifiedStartupCard } from "@/components/nonqualified-startup-card"
import { useToast } from "@/components/ui/use-toast"

interface SavedNonQualifiedStartupListProps {
  nonQualifiedStartups: NonQualifiedStartupData[]
  savedStartups: string[]
  filteredStartups: NonQualifiedStartupData[]
}

export function SavedNonQualifiedStartupList({
  nonQualifiedStartups,
  savedStartups,
  filteredStartups,
}: SavedNonQualifiedStartupListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [localSavedStartups, setLocalSavedStartups] = useState<string[]>(savedStartups)
  const { toast } = useToast()

  const handleSaveChange = async (startupId: string, saved: boolean) => {
    // Update local state for immediate UI feedback
    setLocalSavedStartups((prevSavedStartups) => {
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

      toast({
        title: `${saved ? "Saved" : "Unsaved"} startup`,
        description: saved ? "Startup added to saved items" : "Startup removed from saved items",
      })
    } catch (error) {
      console.error(`Error ${saved ? "saving" : "unsaving"} startup:`, error)
      // Revert the local state change if the API call failed
      setLocalSavedStartups((prevSavedStartups) => {
        if (saved) {
          return prevSavedStartups.filter((id) => id !== startupId)
        } else {
          return [...new Set([...prevSavedStartups, startupId])]
        }
      })

      toast({
        title: "Error",
        description: `Failed to ${saved ? "save" : "unsave"} startup. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
        <p className="text-white text-xl">Loading saved remaining portfolio...</p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        Saved Remaining Portfolio
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
              isSaved={true}
              onSaveChange={(startupId, saved) => handleSaveChange(startupId, saved)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
