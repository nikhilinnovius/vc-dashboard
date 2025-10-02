// API to fetch distinct   (city and state) from companies table
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch distinct cities and states from companies table
    const { data, error } = await supabase
      .from("companies")
      .select("city, state")
      .not("city", "is", null)
      .not("state", "is", null)
      .not("city", "eq", "")
      .not("state", "eq", "")

    if (error) {
      console.error("Error fetching company locations:", error)
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
    )
    }

    // Process the data to create unique cities and states
    const citySet = new Set<string>()
    const stateSet = new Set<string>()

    data?.forEach((item) => {
      if (item.city) {
        let city = item.city.trim()
        // city = city.charAt(0).toUpperCase() + city.slice(1)
        citySet.add(city)
      }
      if (item.state) {
        let state = item.state.trim()
        // state = state.charAt(0).toUpperCase() + state.slice(1)
        stateSet.add(state)
      }
    })

    // Convert sets to sorted arrays
    const cities = Array.from(citySet).sort()
    const states = Array.from(stateSet).sort()
    let locations = [...states, ...cities]
    // Convert to set than a sorted array
    locations = Array.from(new Set(locations))

    return NextResponse.json({
      locations: locations,
      count: locations.length
    }, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600", // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
