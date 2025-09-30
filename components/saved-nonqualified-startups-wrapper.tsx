"use client"

import { useState, useEffect } from "react"
import { useData } from "@/context/data-context"
import { SavedNonQualifiedStartupList } from "@/components/saved-nonqualified-startup-list"
import { Button } from "@/components/ui/button"

interface SavedNonQualifiedStartupsWrapperProps {
  savedStartups: string[]
  userId: string
}

export function SavedNonQualifiedStartupsWrapper({ savedStartups, userId }: SavedNonQualifiedStartupsWrapperProps) {
  const { nonQualifiedStartups } = useData()
  const [loading, setLoading] = useState(true)

  // Log everything for troubleshooting
  useEffect(() => {
    console.log("SavedNonQualifiedStartupsWrapper mounted")
    console.log("User ID:", userId)
    console.log("Saved non-qualified startup IDs:", savedStartups)
    console.log("Non-qualified startups array:", nonQualifiedStartups?.length || 0)

    if (nonQualifiedStartups?.length > 0) {
      console.log(
        "First few non-qualified startup objects:",
        nonQualifiedStartups.slice(0, 3).map((s) => ({
          id: s.id,
          name: s.name,
          website: s.website,
        })),
      )
    }

    setLoading(false)
  }, [savedStartups, userId, nonQualifiedStartups])

  // Force a manual reload of the data
  const forceRefresh = () => {
    window.location.reload()
  }

  if (loading) {
    return <div className="mt-8 text-white">Loading saved non-qualified startups...</div>
  }

  if (!nonQualifiedStartups || nonQualifiedStartups.length === 0) {
    return (
      <div className="mt-8 bg-gray-800/30 p-4 rounded-lg">
        <h2 className="text-xl font-medium text-white mb-2">Saved Remaining Portfolio</h2>
        <p className="text-white/70 mb-4">
          You have {savedStartups.length} saved non-qualified startup(s), but the non-qualified startups data isn't
          available.
        </p>
        <Button onClick={forceRefresh} className="bg-blue-600 hover:bg-blue-700 text-white">
          Refresh Data
        </Button>
      </div>
    )
  }

  // Try an exact match first
  const exactMatches = nonQualifiedStartups.filter((startup) => savedStartups.includes(startup.id))

  // If no exact matches, try more flexible matching
  const filteredStartups =
    exactMatches.length > 0
      ? exactMatches
      : nonQualifiedStartups.filter((startup) => {
          // Try to match with or without the "nonqualified-" prefix
          const baseId = startup.id.replace("nonqualified-", "")
          return savedStartups.some((savedId) => {
            const savedBaseId = savedId.replace("nonqualified-", "")
            return savedBaseId === baseId || savedId === startup.id
          })
        })

  console.log("Filtered non-qualified startups:", {
    exactMatchCount: exactMatches.length,
    flexibleMatchCount: filteredStartups.length,
    matches: filteredStartups.map((s) => s.name),
  })

  if (filteredStartups.length === 0) {
    return (
      <div className="mt-8 bg-gray-800/30 p-4 rounded-lg">
        <h2 className="text-xl font-medium text-white mb-2">Saved Remaining Portfolio</h2>
        <p className="text-white/70">
          You have {savedStartups.length} saved non-qualified startup(s), but none match the current data.
        </p>
        <div className="mt-4 p-3 bg-gray-900/50 rounded text-sm">
          <p className="text-white/60 mb-2">Debugging information:</p>
          <p className="text-white/60">Saved IDs: {savedStartups.join(", ")}</p>
          <p className="text-white/60">
            First few available startup IDs:{" "}
            {nonQualifiedStartups
              .slice(0, 5)
              .map((s) => s.id)
              .join(", ")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <SavedNonQualifiedStartupList
      nonQualifiedStartups={nonQualifiedStartups}
      savedStartups={savedStartups}
      filteredStartups={filteredStartups}
    />
  )
}
