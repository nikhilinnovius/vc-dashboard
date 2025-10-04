// This is the retrieve VCs API
// It fetched VC data (around 7000 rows) from supabase so that we can feed it to the frontend

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"


export async function GET(req: Request) {
  const supabase = await createClient()

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") ?? "1")
  const itemsPerPage = 50 // VCs displayed per page in UI
  const limit = 250 // VCs loaded per API call (5 pages worth)
  const offset = (page - 1) * limit

  console.log("Fetching VCs for page", page)

  // First, get the total count
  const { count, error: countError } = await supabase
    .from("vcs")
    .select("*", { count: "exact", head: true })

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  console.log("Total VCs:", count)
  console.log("started time:", new Date().toISOString())
  // Then get the supabase data: batch by batch
  let { data, error } = await supabase
    .from("vcs")
    .select("*")
    .order("vc_score", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {  
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log("Finished time:", new Date().toISOString())
  console.log("Time taken on a molecular level:", new Date().getTime() - new Date().getTime())

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Return pagination metadata along with data
  return NextResponse.json({
    vcs: data,
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: itemsPerPage, // UI pagination size
    apiLimit: limit // API batch size
  }, {
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    },
  })
}
