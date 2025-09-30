"use client"
import { StartupDetails } from "@/components/startup-detailed/StartupDetailsRefactored"
import { useRouter } from "next/navigation"

export default function StartupDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  const handleBack = () => {
    // Check if the previous page is within our app
    if (document.referrer && document.referrer.includes(window.location.origin)) {
      // Previous page is from our app, safe to go back
      // get the url of the previous page
      const previousPage = document.referrer
      console.log('Previous page:', previousPage)
      router.push(previousPage)
    } else {
      // Came from external site or direct visit, go to home page
      router.push("/")
    }
  }

  console.log('StartupDetailsPage mounted with ID:', params.id)
  
  return <StartupDetails startupId={decodeURIComponent(params.id)} onBack={handleBack} />
}