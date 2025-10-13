"use client"

import { useState, useCallback } from "react"
// import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { useToast } from "@/components/ui/use-toast"
import { HeaderSection } from "@/components/vc-dashboard/core/HeaderSection"
import { useCustomAuth } from "@/hooks/use-custom-auth"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, status } = useCustomAuth()
  // const { data: session, status } = useSession()
  const router = useRouter()
  const { themeGradient } = useTheme()
  const { toast } = useToast()


  const handlePreferencesOpen = useCallback(() => {
    // This would open a preferences dialog
    console.log("Preferences clicked")
  }, [])

  const handleViewSavedItems = useCallback((type: "vcs" | "startups") => {
    router.push(`/saved-${type}`)
  }, [router])

  const handleVCSelect = useCallback((vcId: string) => {
    router.push(`/vcs/${vcId}`)
      // router.push(`/?vc=${encodeURIComponent(vc)}`)
  }, [router])

  const handleStartupSelect = useCallback((startupId: string) => {
    router.push(`/startups/${startupId}`)
      // router.push(`/?startup=${encodeURIComponent(startup)}`)
  }, [router])

  const handleEntityTypeChange = useCallback((value: string) => {
    if (value === "vc") {
      router.push("/")
    } else if (value === "startup") {
      router.push("/companies")
    } else if (value === "location") {
      // Handle location filter - could open a modal or navigate to a location-specific page
      console.log("Location filter clicked")
    }
  }, [router])

  const handleLocationFilterOpen = useCallback(() => {
    console.log("Location filter opened")
  }, [])

  // For now, let's hardcode authenticated status to show the header elements
  const isAuthenticated = status === "authenticated" || true // TODO: remove in prod: Temporary hardcode

  console.log('🔍 LayoutWrapper Debug:', {
    status,
    isAuthenticated,
    user
  })

  return (
    <div className={`flex min-h-screen flex-col bg-gradient-to-br ${themeGradient}`}>
      <div className="p-3 sm:p-6 sm:pb-4 lg:p-8 lg:pb-6">
        <HeaderSection
        status={isAuthenticated ? "authenticated" : "unauthenticated"}
        session={ status === "authenticated" ? { user } : {
          user: {
            name: "Test User",
            email: "test@example.com",
          },
        }}
        onPreferencesOpen={handlePreferencesOpen}
        onViewSavedItems={handleViewSavedItems}
        onVCSelect={handleVCSelect}
        onStartupSelect={handleStartupSelect}
        onLocationFilterOpen={handleLocationFilterOpen}
        />
      </div>
      <main className="flex-1 p-5">
        {children}
      </main>
    </div>
  )
}
