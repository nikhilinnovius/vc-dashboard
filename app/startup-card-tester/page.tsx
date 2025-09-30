// fetch CompanyCard component and display it
"use client"

import { StartupCard } from "@/components/vc-dashboard/core/StartupCard"

export default function StartupCardTester() {
  const startupData = {
    id: "1",
    name: "Startup 1",
    website: "https://www.startup1.com",
    city: "Startup City",
    state: "Startup State",
    lastRound: "Series A",
    totalRaised: 1000000,
    companyScore: 100,
  }
  return (
    <div>
      <StartupCard startupData={startupData} layout="list" isSaved={false} />
    </div>
  )
}