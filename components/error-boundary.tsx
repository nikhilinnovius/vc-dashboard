"use client"

import type React from "react"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error | null
  reset: () => void
  fallback?: React.ReactNode
}

export function ErrorBoundary({ error, reset, fallback }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (error) {
      console.error("Error boundary caught error:", error)
    }
  }, [error])

  if (!error) {
    return null
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
      <p className="text-white/70 mb-6 max-w-md">
        {error && typeof error === "object" && "message" in error
          ? error.message
          : "An unexpected error occurred while loading the data."}
      </p>
      <Button onClick={reset} className="bg-white/20 text-white hover:bg-white/30">
        Try again
      </Button>
    </div>
  )
}
