// This is the API to fetch the startups for a specific VC
// Given a VC ID, it will fetch the startups for that VC using supabase
// There is a table called vc_company_relations which has the vc_id and the company_id as foreign keys
// We will use the vc_id to fetch the startups for that VC

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { frontendToBackendRoundMap } from "@/lib/round-mapping"

export async function GET(request: Request, { params }: { params: { "vc-id": string } }) {
  const supabase = await createClient()
  const vcId = params["vc-id"]
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") ?? "1")
  const limit = 50 // Items per page for display
  const offset = (page - 1) * limit

  // Get filter parameters
  const rounds = searchParams.get("rounds")?.split(",").map(r => r.trim()).filter(Boolean) || []
  const endMarkets = searchParams.get("endMarkets")?.split(",").map(m => m.trim()).filter(Boolean) || []
  const companyStatuses = searchParams.get("companyStatuses")?.split(",").map(s => s.trim()).filter(Boolean) || []
  const locationFilter = searchParams.get("location")?.split(",").map(l => l.trim()).filter(Boolean) || []

  // Map frontend round filters to backend format
  console.log('DEBUG: frontendToBackendRoundMap:', frontendToBackendRoundMap)
  console.log('DEBUG: rounds to map:', rounds)
  const backendRoundFilters = rounds.map(round => {
    const mapped = frontendToBackendRoundMap[round]
    console.log(`DEBUG: mapping "${round}" -> "${mapped}" (type: ${typeof mapped})`)
    return mapped
  }).filter(Boolean)
  console.log('backendRoundFilters:', backendRoundFilters)
  
  console.log('API received filters:', {
    rounds,
    backendRoundFilters,
    endMarkets,
    companyStatuses,
    locationFilter
  })

  try {
    // First, get the total count of all portfolio companies for this VC
    const { count: totalCount, error: countError } = await supabase
      .from("vc_company_relations")
      .select("company_id", { count: "exact", head: true })
      .eq("vc_id", vcId)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Get all company IDs for this VC (we need all to apply filters)
    const { data: allCompanyIds, error: allCompanyIdsError } = await supabase
      .from("vc_company_relations")
      .select("company_id")
      .eq("vc_id", vcId)

    if (allCompanyIdsError) {
      return NextResponse.json({ error: allCompanyIdsError.message }, { status: 500 })
    }

    const companyIds = allCompanyIds?.map((company) => company.company_id) || []

    if (companyIds.length === 0) {
      return NextResponse.json({ 
        startups: [], 
        totalItems: 0, 
        totalPages: 0, 
        currentPage: page,
        numberOfStartups: 0 
      })
    }

    // Fetch companies from both qualified and non-qualified tables
    const [qualifiedResult, nonqualifiedResult] = await Promise.all([
      supabase
        .from("companies")
        .select("*")
        .in("id", companyIds)
        .order("company_score", { ascending: false }),
      supabase
        .from("companies_nonqualified")
        .select("*")
        .in("id", companyIds)
        .order("company_score", { ascending: false })
    ])

    if (qualifiedResult.error) {
      return NextResponse.json({ error: qualifiedResult.error.message }, { status: 500 })
    }

    if (nonqualifiedResult.error) {
      return NextResponse.json({ error: nonqualifiedResult.error.message }, { status: 500 })
    }

    // Combine and filter companies
    // Add "not in affinity" before the beginning of nonqualified results
    let allCompanies = [...(qualifiedResult.data || []), ...(nonqualifiedResult.data || [])]

    // Apply filters
    console.log("DEBUG: Applying round filters")
    console.log('allCompanies:', allCompanies.slice(0, 5).map(c => ({ 
      name: c.name, 
      lastRound: c.lastRound,
      city: c.city,
      state: c.state
    })))
    console.log('backendRoundFilters:', backendRoundFilters)
    console.log('backendRoundFilters', backendRoundFilters)
    if (backendRoundFilters.length > 0) {   
        allCompanies = allCompanies.filter(company => backendRoundFilters.includes(company.last_round || company.last_funding_type || ''))
    }
    console.log("DEBUG: After round filtering:", allCompanies.length, "companies")
    if (endMarkets.length > 0) {
      allCompanies = allCompanies.filter(company => 
        endMarkets.includes(company.end_market || '')
      )
    }

    if (companyStatuses.length > 0) {
      allCompanies = allCompanies.filter(company => 
        companyStatuses.includes(company.company_status || '') ||
        companyStatuses.includes(company.status || '')
      )
    }

    // Apply location filter
    if (locationFilter.length > 0) {
      console.log('Before location filtering:', allCompanies.length, 'companies')
      console.log('Sample company locations:', allCompanies.slice(0, 5).map(c => ({ 
        name: c.name, 
        city: c.city, 
        state: c.state 
      })))
      
      allCompanies = allCompanies.filter(company => {
        const companyCity = company.city?.toLowerCase() || ''
        const companyState = company.state?.toLowerCase() || ''
        
        const matches = locationFilter.some(location => {
          const locationLower = location.toLowerCase()
          const cityMatch = companyCity.includes(locationLower)
          const stateMatch = companyState.includes(locationLower)
          const combinedMatch = `${companyCity}, ${companyState}`.includes(locationLower)
          
          if (cityMatch || stateMatch || combinedMatch) {
            console.log(`Location match found: ${company.name} (${company.city}, ${company.state}) matches "${location}"`)
          }
          
          return cityMatch || stateMatch || combinedMatch
        })
        
        return matches
      })
      
      console.log('After location filtering:', allCompanies.length, 'companies')
    }

    // Apply pagination to filtered results
    const totalFilteredItems = allCompanies.length
    const totalPages = Math.ceil(totalFilteredItems / limit)
    const paginatedCompanies = allCompanies.slice(offset, offset + limit)

    return NextResponse.json({ 
      startups: paginatedCompanies, 
      totalItems: totalFilteredItems,
      totalPages: totalPages,
      currentPage: page,
      numberOfStartups: totalFilteredItems // This is now the filtered total, not just current page
    })

  } catch (error) {
    console.error('Error fetching portfolio companies:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch portfolio companies' 
    }, { status: 500 })
  }
}