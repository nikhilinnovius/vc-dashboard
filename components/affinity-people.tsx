"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Loader2, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Person {
  id?: number
  name: string
  email: string
  title?: string | null
  linkedin?: string | null
}

interface AffinityPeopleProps {
  domain: string
}

export function AffinityPeople({ domain }: AffinityPeopleProps) {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [openTooltip, setOpenTooltip] = useState<number | null>(null)

  // Add refs for each tooltip and badge
  const tooltipRefs = useRef<(HTMLDivElement | null)[]>([])
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!domain) {
      setPeople([{ name: "Not Available", email: "Not Available" }])
      setIsLoading(false)
      return
    }

    const fetchPeople = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/affinity/people?domain=${encodeURIComponent(domain)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch people: ${response.status}`)
        }

        const data = await response.json()
        setPeople(data.people || [{ name: "Not Available", email: "Not Available" }])
      } catch (err) {
        console.error("Error fetching people:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
        setPeople([{ name: "Not Available", email: "Not Available" }])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPeople()
  }, [domain])

  // Initialize refs when people data changes
  useEffect(() => {
    tooltipRefs.current = tooltipRefs.current.slice(0, people.length)
    badgeRefs.current = badgeRefs.current.slice(0, people.length)
  }, [people])

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openTooltip !== null) {
        const tooltipEl = tooltipRefs.current[openTooltip]
        const badgeEl = badgeRefs.current[openTooltip]

        if (
          tooltipEl &&
          badgeEl &&
          !tooltipEl.contains(event.target as Node) &&
          !badgeEl.contains(event.target as Node)
        ) {
          setOpenTooltip(null)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openTooltip])

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    navigator.clipboard
      .writeText(email)
      .then(() => {
        setCopiedEmail(email)
        setTimeout(() => setCopiedEmail(null), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy email:", err)
      })
  }

  const toggleTooltip = (index: number) => {
    setOpenTooltip((prev) => (prev === index ? null : index))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-white/70 mr-2" />
        <span className="text-white/70">Loading people data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-white/70 py-2">Could not load people data</div>
  }

  const hasValidPeople = people.some((person) => person.name !== "Not Available")

  return (
    <div className="flex flex-wrap gap-2">
      {hasValidPeople ? (
        people.map((person, index) => (
          <div key={person.id || index} className="relative">
            {/* Badge that toggles tooltip on click */}
            <div
              ref={(el) => (badgeRefs.current[index] = el)}
              onClick={() => toggleTooltip(index)}
              className="cursor-pointer"
            >
              <Badge
                variant="outline"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  "bg-white/5 hover:bg-white/10 text-white border-0",
                )}
              >
                {person.name}
                {person.title && <span className="ml-1 opacity-70">({person.title})</span>}
              </Badge>
            </div>

            {/* Tooltip that's shown when openTooltip === index */}
            {openTooltip === index && (
              <div
                ref={(el) => (tooltipRefs.current[index] = el)}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm rounded-md shadow-lg z-[9999] bg-[#111827] border border-gray-800"
              >
                <div className="relative">
                  {person.title && <p className="text-[#FFCC99] text-sm">{person.title}</p>}
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <p className="text-[#FFCC99] text-sm">{person.email}</p>
                    <button
                      onClick={(e) => handleCopyEmail(person.email, e)}
                      className="text-[#FFCC99]/70 hover:text-[#FFCC99] transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail === person.email ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:underline block mt-1 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      LinkedIn Profile
                    </a>
                  )}

                  {/* Tooltip arrow */}
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#111827]"
                    style={{ width: 0, height: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-white/70">No people data available</div>
      )}
    </div>
  )
}
