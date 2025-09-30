// Filter Tab will be in the form of a ribbon that will be placed below the VC Name and the VC Score in the VC Detail Page
// It will comprise 3 dropdown components: a dropdown for filtering by location, a dropdown for filtering by round, a dropdown for filtering by company status, a dropdown for filtering by workflow trigger and a dropdown for filtering by end market

import React from 'react'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

const endMarketOptions: string[] = [
    "Healthcare",
    "GTM",
    "Cybersecurity",
    "Consumer & Retail & Ecom",
    "DevOps",
    "Data Stack",
    "Supply Chain",
    "HCM / Benefits",
    "AI",
    "Construction Tech",
    "Property Tech",
    "Education",
    "Hospitality / Entertainment / Food",
    "Utility / Energy / Climate",
    "Field Services",
    "Insurance",
    "Media / Entertainment / Live Events",
    "Biotech / Pharma / Life Science",
    "Governance, Risk, Compliance (GRC)",
    "Manufacturing",
    "Office of CFO",
    "Public Sector and GovTech",
    "IT / Telecom",
    "Food & Beverage",
    "Financial Institutions",
    "Payments",
    "Industrial",
    "Auto",
    "Asset & Wealth Management",
    "Banking",
    "MLOps",
    "Procurement",
    "Enterprise Automation",
    "Legal Tech",
    "General Multi Site",
    "Agriculture",
    "Data Privacy",
    "Customer Service",
    "Product Development",
    "Aerospace & Defense",
    "Professional Services",
    "Capital Markets",
    "Commercial Services",
    "Entertainment",
    "Transportation",
    "Energy",
    "Climate",
    "Pet Tech",
    "Risk",
    "Crypto",
    "Beauty & Wellness"
  ];
  
  const lastRoundMap: Record<string, string> = {
    "PRE_SEED": "Pre-Seed",
    "SEED": "Seed",
    "SERIES_A": "Series A",
    "SERIES_B": "Series B",
    "SERIES_C": "Series C",
    "SERIES_D": "Series D",
  }

  const companyStatusOptions: string[] = [
    "Follow-up meeting(s)",
    "Data Room",
    "Not Available",
    "Cold",
    "Paused",
    "Nurture",
    "Contacted",
    "Term Sheet",
    "Portfolio",
    "Engaged",
    "Tracking - Too Early",
    "IC 1",
    "In Queue",
    "Closed",
    "Meeting Booked",
    "1st Meeting"
  ];
  
export const FilterTabStartups = () => {
  return (
    <div>
        
    </div>
  )
}