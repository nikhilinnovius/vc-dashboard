"use client"
import { StartupDetails } from "@/components/startup-detailed/StartupDetailsRefactored"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"

export default function StartupDetailsPage({ params }: { params: { id: string } }) {
  // const router = useRouter()
  // const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null)
  
  // Capture previous page URL on mount
  // useEffect(() => {
  //   // Try to get referrer first
  //   if (document.referrer && document.referrer.includes(window.location.origin)) {
  //     const referrerUrl = new URL(document.referrer)
  //     const referrerPath = referrerUrl.pathname
      
  //     // Handle main pages and VC detail pages
  //     if (referrerPath === "/" || referrerPath === "/vcs" || referrerPath.startsWith("/vcs/")) {
  //       setPreviousPageUrl(document.referrer)
  //       console.log('Captured previous page URL from referrer:', document.referrer)
  //       return
  //     }
  //   }
  // }, [])
  
  // Back functionality disabled
  // const handleBack = () => {
  //   console.log('=== STARTUP BACK BUTTON DEBUG ===')
  //   console.log('Previous page URL:', previousPageUrl)
  //   console.log('Document referrer:', document.referrer)
  //   if (previousPageUrl) {
  //     try {
  //       const referrerUrl = new URL(previousPageUrl)
  //       const referrerPath = referrerUrl.pathname
  //       const searchParams = referrerUrl.search
  //       
  //       // If coming from a VC detail page, go back to that VC page
  //       if (referrerPath.startsWith("/vcs/")) {
  //         console.log('Navigating back to VC page:', referrerPath + searchParams)
  //         router.push(referrerPath + searchParams)
  //         return
  //       }
  //       
  //       // If coming from main pages, go to startups page with search params
  //       if (referrerPath === "/" || referrerPath === "/vcs") {
  //         const startupsUrl = `/startups${searchParams}`
  //         console.log('Navigating to startups page with search params:', startupsUrl)
  //         router.push(startupsUrl)
  //         return
  //       }
  //     } catch (e) {
  //       console.error('Error parsing previous page URL:', e)
  //     }
  //   }
  //   
  //   // Fallback: go to startups page without search params
  //   console.log('No previous page available, going to startups page')
  //   router.push("/startups")
  // }



  console.log('StartupDetailsPage mounted with Startup ID:', params.id)
  
  // Back button disabled by not passing onBack
  return <StartupDetails startupId={decodeURIComponent(params.id)} />
}