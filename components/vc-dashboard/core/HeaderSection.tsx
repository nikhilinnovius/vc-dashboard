import React from 'react'
import Image from "next/image"
import { LogIn, ChevronDown, X, Filter, Building2, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button" 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InstantSearchCommand } from "@/components/instant-search-command"
import { BackToAthenaButton } from "@/components/vc-dashboard/core/BackToAthena"
import { Suspense } from "react"
import { useRouter, usePathname } from 'next/navigation'

const capitalizeFirstLetter = (string: string) => {
  if (!string) return ""
  return string.charAt(0).toUpperCase() + string.slice(1)
}

interface HeaderSectionProps {
  status: string
  session: any
  onPreferencesOpen: () => void
  onViewSavedItems: (type: "vcs" | "startups") => void
  onVCSelect: (vc: string) => void
  onStartupSelect: (startup: string) => void
  onLocationFilterOpen: () => void
  // onResetToHome: () => void
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  status = "authenticated",
  session = {
    user: {
      name: "Test User",
      email: "test@example.com",
    },
  },
  onPreferencesOpen,
  onViewSavedItems,
  onVCSelect,
  onStartupSelect,
  onLocationFilterOpen,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const handleNavigateToHome = () => {
    console.log('Athena button clicked - function called')
    // move to home page
    router.push("/")

    // redirect("/") 
    // // window.open("https://athena.innoviuscapital.com", "_self")
  }

  console.log('HeaderSection Debug:', {
    status,
    session,
    isAuthenticated: status === "authenticated"
  })

  console.log('[HeaderSection] Session:', session)

  return (
    <header className="mb-6 flex flex-col gap-6 items-center justify-between space-y-4 sm:flex-row sm:space-y-0 w-full">
        {/* <span>Athena</span> */}
              {/* ATHENA Logo Text */}
      <Button 
        variant="ghost" 
        className="p-0 hover:opacity-90 mb-8 sm:mb-0 hover:bg-transparent" 
        onClick={handleNavigateToHome}>
            <div className="text-center mb-12 relative">
                <h2 className="text-8xl md:text-7xl font-thin text-white mt-20">ATHENA</h2>
                <span className="text-sm tracking-[0.3em] mt-[-0.25rem] text-white/70">
                  VC DASHBOARD
                </span>
                {/* <div className="absolute bottom-[-15px] right-[-30px] text-xs text-white/60 font-medium">
                    VC Dashboard
                </div> */}
            </div>
      </Button>
             
      
      <div className="flex w-full flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 sm:w-auto">
          <>
            <BackToAthenaButton className="order-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-10 px-3 py-2 text-sm order-4"
                >
                  <span>
                    Welcome {" "}
                    {session?.user?.name ? capitalizeFirstLetter(session.user.name) : (session?.user?.email || "User")}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={onPreferencesOpen}>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/saved/vcs")}>Saved VCs</DropdownMenuItem> 
                <DropdownMenuItem onSelect={() => router.push("/saved/startups")}>Saved Startups</DropdownMenuItem>
                {/* <DropdownMenuItem onSelect={() => router.push("/feature-request")}>  
                  Feature Request
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Suspense fallback={<div className="w-[200px] h-10 bg-white/10 rounded animate-pulse order-2" />}>
              <div className="order-2">
                <InstantSearchCommand 
                  onVCSelect={onVCSelect} 
                  onStartupSelect={(startup) => onStartupSelect(startup)} 
                />
              </div>
            </Suspense>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] bg-white/10 text-white hover:bg-white/20 border-white/20 order-3 justify-between"
                >
                  {pathname.includes("/startups") ? "View Startups" : pathname.includes("/vcs") || pathname == "/" ? "View VCs" : "Not on Affinity"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => router.push("/")}>
                  <Building2 className="mr-2 h-4 w-4" />
                  View VCs
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/startups")}>
                  <Users className="mr-2 h-4 w-4" />
                  View Startups
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/not-on-affinity")}>
                  <Users className="mr-2 h-4 w-4" />
                  Not on Affinity
                </DropdownMenuItem>
                {/* <DropdownMenuItem onSelect={() => router.push("/admin")}>
                  <MapPin className="mr-2 h-4 w-4" />
                  By Location
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
      </div>
    </header>
  )
}
