// This is the API to retrieve all VCs 
// It fetched VC data (around 7000 rows) from supabase so that we can feed it to the frontend

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"


export async function GET(req: Request) {
  const supabase = await createClient()
  const itemsPerPage = 20 // VCs displayed per page in UI

  console.log("Fetching all VCs")
  const startTime = new Date().getTime()

  // Then get the supabase data: all VCs. Since we are fetching all VCs and supabase only selects 1000 rows at a time, we need to fetch all VCs in batches.

  const { count, error: countError } = await supabase
    .from("vcs")
    .select("*", { count: "exact", head: true })
  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  let totalRows = count || 0
        
  const batchSize = 1000
  let results: any[] = []

  for (let offset = 0; offset < totalRows; offset += batchSize) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("company_score", { ascending: false })
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error("Error fetching batch:", error.message)
      break
    }

    results = results.concat(data || [])
  }

  console.log("Finished time:", new Date().toISOString())
  const endTime = new Date().getTime()


  const totalItems = totalRows || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Return pagination metadata along with data
  return NextResponse.json({
    companies: results,
    totalItems,
    itemsPerPage: itemsPerPage, // UI pagination size
    totalPages,
    timeTaken: endTime - startTime,
  }, {
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    },
  })
}
