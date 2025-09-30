import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { useData } from "@/context/data-context"
import { useToast } from "@/components/ui/use-toast"
import { NonQualifiedStartupCard } from "@/components/nonqualified-startup-card"

interface SavedNonQualifiedStartupsSectionProps {
  userId: string
}

export const SavedNonQualifiedStartupsSection: React.FC<SavedNonQualifiedStartupsSectionProps> = ({ 
  userId 
}) => {
  const { nonQualifiedStartups } = useData()
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSavedIds() {
      try {
        const response = await fetch("/api/nonqualified/saved")
        if (response.ok) {
          const data = await response.json()
          setSavedIds(data.savedStartups || [])
        }
      } catch (error) {
        console.error("Error fetching saved non-qualified startups:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedIds()
  }, [])

  if (loading) {
    return <div className="mt-8 text-white">Loading saved remaining portfolio...</div>
  }

  if (savedIds.length === 0) {
    return null
  }

  const matchingStartups = nonQualifiedStartups.filter((startup) => savedIds.includes(startup.id))
  const uniqueStartups = Array.from(new Map(matchingStartups.map((startup) => [startup.name, startup])).values())

  if (uniqueStartups.length === 0) {
    return (
      <div className="mt-12 p-4 bg-gray-800/50 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-2">Saved Remaining Portfolio</h2>
        <p className="text-white/80">
          You have {savedIds.length} saved remaining portfolio startups, but they couldn't be matched with the current
          data.
        </p>
        <div className="mt-2 text-sm text-white/60">Saved IDs: {savedIds.join(", ")}</div>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        Saved Remaining Portfolio
        <span className="ml-2 text-base font-normal text-white/60">
          {uniqueStartups.length} {uniqueStartups.length === 1 ? "startup" : "startups"}
        </span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 auto-rows-fr">
        {uniqueStartups.map((startup, index) => (
          <motion.div
            key={startup.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(0.03 * index, 0.15) }}
            className="h-full"
          >
            <NonQualifiedStartupCard
              startup={{
                ...startup,
                raisePredictor: startup.raisePredictor,
              }}
              isSaved={true}
              onSaveChange={(startupId, saved) => {
                const endpoint = `/api/nonqualified/${saved ? "save" : "unsave"}`
                fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: startupId }),
                })
                  .then((response) => {
                    if (response.ok) {
                      if (!saved) {
                        setSavedIds((prev) => prev.filter((id) => id !== startupId))
                      }
                      toast({
                        title: `${saved ? "Saved" : "Unsaved"} startup`,
                        description: saved ? "Startup added to saved items" : "Startup removed from saved items",
                      })
                    }
                  })
                  .catch((error) => {
                    console.error("Error saving/unsaving:", error)
                    toast({
                      title: "Error",
                      description: `Failed to ${saved ? "save" : "unsave"} startup`,
                      variant: "destructive",
                    })
                  })
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
