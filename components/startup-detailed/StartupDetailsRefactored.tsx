"use client"

import React, { useState, useEffect, useMemo } from "react"
import { ArrowLeft, Linkedin, Globe, Award, Calendar, Users, User, FileText, Clipboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CompanyLogo } from "@/components/vc-dashboard/core/OrgIcon"
import { SaveButton } from "@/components/SaveButton"
import { AffinityNotes } from "@/components/affinity-notes"
// import { AffinityPeople } from "@/components/affinity-people"

// New imports for refactored components
import { SectionHeader } from "./SectionHeader"
import { StatItem } from "./StatItem"
import { RaisePredictionIndicator } from "./RaisePredictionIndicator"
import { FundingSection } from "./sections/FundingSection"
import { GrowthMetricsSection } from "./sections/GrowthMetricsSection"
import { KeyDetailsSection } from "./sections/KeyDetailsSection"
import { CurrentInvestorsSection } from "./sections/CurrentInvestorsSection"
import { CEOLinkedInSection } from "./sections/CEOLinkedInSection"
import { ScoreReasoningSection } from "./sections/ScoreReasoningSection"
import { InnoviusCoverageSection } from "./sections/InnoviusCoverageSection"
import { AdditionalDetailsSection } from "./sections/AdditionalDetailsSection"
import { PeopleSection } from "./sections/PeopleSection"  

// Utility imports
import { formatEmployeeCount, extractVCName, getCompanyScoreColor, formatStartupDate } from "@/utils/startup-utils"
import { getStatusColor } from "@/utils/startup-utils"

// Hook and type imports
import { SavedItemsService } from "@/services/saved-items-service"
import type { StartupDetailsProps } from "@/types/startup"
import { transformToStartupData } from "@/lib/data-transforms"
import type { StartupData } from "@/lib/data-utils"


export function StartupDetails({ startupId, onBack }: StartupDetailsProps) {
  const [startupData, setStartupData] = useState<StartupData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Fetch startup data directly from API
  useEffect(() => {
    const fetchStartupData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log(`Fetching startup with ID: ${startupId}`)
        const response = await fetch(`/api/startup/${encodeURIComponent(startupId)}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Startup not found')
          }
          throw new Error(`Failed to fetch startup: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        // Transform the raw data to match our expected format
        const transformedData = transformToStartupData(result.data)
        console.log('Fetched startup data:', transformedData)
        setStartupData(transformedData)
        
      } catch (err) {
        console.error('Error fetching startup:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch startup data')
        setStartupData(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (startupId) {
      fetchStartupData()
    }
  }, [startupId])


  // Fetch saved status using service
  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const savedStartups = await SavedItemsService.fetchSavedStartups()
        setIsSaved(savedStartups.includes(startupId))
      } catch (error) {
        console.error("Failed to fetch saved status:", error)
      }
    }
    
    if (startupData) {
      fetchSavedStatus()
    }
  }, [startupId, startupData])

  // Loading state
  if (isLoading) {
    return <LoadingState onBack={onBack} />
  }

  // Error state
  if (error) {
    return <ErrorState onBack={onBack} error={error} />
  }

  // Not found state
  if (!startupData) {
    return <NotFoundState onBack={onBack} />
  }

  const vcName = extractVCName(startupData.id) // Using id since vcId might not be available

  return (
    <div className="space-y-6 pt-4 w-full overflow-x-hidden">
      <BackButton onBack={onBack} />
      
      <Card className="overflow-hidden bg-[#132b12]/90 backdrop-blur-lg border-white/20 shadow-xl">
        <StartupHeader 
          data={startupData}
          startupId={startupId}
          isSaved={isSaved}
        />
        
        <StartupContent data={startupData} />
      </Card>
    </div>
  )
}

// Sub-components for better organization
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Button variant="ghost" onClick={onBack} className="text-white">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  )
}

function LoadingState({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6 pt-4 w-full overflow-x-hidden">
      <BackButton onBack={onBack} />
      <Card className="bg-white/10 backdrop-blur-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4" />
            <p className="text-white text-center">Loading startup details...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState({ onBack, error }: { onBack: () => void, error: string }) {
  return (
    <div className="space-y-6 pt-4 w-full overflow-x-hidden">
      <BackButton onBack={onBack} />
      <Card className="bg-white/10 backdrop-blur-lg">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">Error loading startup data</p>
            <p className="text-white/70 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6 pt-4 w-full overflow-x-hidden">
      <BackButton onBack={onBack} />
      <Card className="bg-white/10 backdrop-blur-lg">
        <CardContent className="p-6">
          <p className="text-white text-center py-8">Startup data not found</p>
        </CardContent>
      </Card>
    </div>
  )
}

function StartupHeader({ 
  data, 
  startupId, 
  isSaved 
}: { 
  data: StartupData
  startupId: string
  isSaved: boolean 
}) {
  return (
    <CardHeader className="border-b border-white/20 pb-6">
      <div className="startup-details-header">
        <div className="flex items-start gap-6 mb-4">
          <CompanyLogo
            domain={data.website || undefined}
            name={data.name}
            size={80}
            type="startup"
            className="flex-shrink-0 rounded-lg shadow-lg"
          />

          <div className="flex flex-col justify-between min-w-0 flex-1">
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex flex-col mt-2">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white break-words">{data.name}</h1>

                  {/* Social Links - right after company name */}
                  <div className="flex items-center gap-2">
                    {data.linkedin && (
                      <a
                        href={data.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 hover:text-blue-300 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    
                    {data.website && (
                      <a
                        href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 hover:text-green-300 transition-colors"
                        title="Website"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                
                {/* City and State - below company name */}
                <div className="flex items-center text-white text-sm">
                  <span>{data.city}, {data.state}</span>
                </div>
              </div>
              
              {/* Trio positioned at rightmost end of same row */}
              <div className="flex items-center gap-2">
                {data.companyStatus && (
                  <Badge
                    variant="outline"
                    className="text-black px-3 py-1 text-sm font-medium"
                    style={{
                      backgroundColor: getStatusColor(data.companyStatus),
                      borderColor: "transparent",
                    }}
                  >
                    {data.companyStatus}
                  </Badge>
                )}
                <SaveButton itemId={startupId} itemType="startup" initialSaved={isSaved} />
                <RaisePredictionIndicator raisePredictor={data.raisePredictor} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <QuickStats data={data} />
        </div>
      </div>
    </CardHeader>
  )
}

function QuickStats({ data }: { data: StartupData }) {
  return (
    <div className="flex flex-wrap gap-6">
      {data.companyScore && (
        <div className="flex items-center">
          <Award className="h-5 w-5 text-white mr-2" />
          <span className="text-white inline-flex items-baseline">
            <b>Score:</b>
            <span className={`ml-1.5 ${getCompanyScoreColor(data.companyScore)}`}>
              {Math.round(parseFloat(String(data.companyScore)))}
            </span>
          </span>
        </div>
      )}
      
      {data.foundedDate && (
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-white mr-2" />
          <span className="text-white font-bold">Founded:</span>
          <span className="ml-1 text-white break-words">{formatStartupDate(data.foundedDate)}</span>  
        </div>
      )}
      
      {data.totalEmployees && (
        <div className="flex items-center">
          <Users className="h-5 w-5 text-white mr-2" />
          <span className="text-white font-bold">Employees:</span>
          <span className="ml-1 text-white break-words">
            {formatEmployeeCount(String(data.totalEmployees))}
          </span>
        </div>
      )}
    </div>
  )
}

function StartupContent({ data }: { data: StartupData }) {
  return (
    <CardContent className="p-6 startup-details-content">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeftColumn data={data} />
        <RightColumn data={data} />
      </div>
    </CardContent>
  )
}

function LeftColumn({ data }: { data: StartupData }) {
  return (
    <div className="space-y-6 md:col-span-2">
      {/* Summary */}
      <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
        <SectionHeader icon={<Clipboard className="h-5 w-5 text-white" />} title="Description" />
        <p className="text-white leading-relaxed break-words">{data.description}</p>
      </section>

      {/* Funding Information */}
      <FundingSection data={data} />

      {/* CEO LinkedIn */}
      <CEOLinkedInSection ceoLinkedin={data.ceoLinkedin || ""} />

      {/* Score Reasoning */}
      <ScoreReasoningSection scoreReasoning={data.scoreReasoning || ""} />

      {/* Notes */}
      <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
        <SectionHeader icon={<FileText className="h-5 w-5 text-white" />} title="Notes" />
        <AffinityNotes domain={data.website || ""} />
      </section>
    </div>
  )
}

function RightColumn({ data }: { data: StartupData }) {
  return (
    <div className="space-y-6">
      <KeyDetailsSection data={data} />
      <CurrentInvestorsSection data={data} />
      {/* <PeopleSection data={data} /> */}
      <GrowthMetricsSection data={data} />
      <InnoviusCoverageSection data={data} />
      <AdditionalDetailsSection data={data} />
    </div>
  )
}

// All section components have been moved to separate files in ./sections/
