import { useMemo } from "react"
import { useData } from "@/context/data-context"
import type { StartupData } from "@/lib/data-utils"

export function useStartupData(startup: string): StartupData | null {
  const { startups } = useData()

  return useMemo(() => {
    if (!startups || startups.length === 0) return null

    // First, try to match by domain/website
    if (startup.includes(".")) {
      const domainMatch = startups.find((s) => {
        const sDomain = s.domain || s.website
        if (!sDomain) return false

        const cleanStartupDomain = startup.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "")
        const cleanSDomain = sDomain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "")

        return cleanSDomain === cleanStartupDomain
      })

      if (domainMatch) return domainMatch
    }

    // Fallback to name matching
    return startups.find((s) => s.name === startup) || null
  }, [startups, startup])
}

