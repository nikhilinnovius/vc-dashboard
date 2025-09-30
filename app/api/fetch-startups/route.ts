// This is the retrieve Companies API
// It fetched VC data (around 7000 rows) from supabase so that we can feed it to the frontend

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"


export async function GET(req: Request) {
  const supabase = await createClient()

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") ?? "1")
  const cardsPerPage = 20 // Companies displayed per page in UI
  const limit = 200 // Companies loaded per API call (10 pages worth)
  const offset = (page - 1) * limit

  console.log("Fetching Startups for page", page)

  // First, get the total count
  const { count, error: countError } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  // Then get the paginated data
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("company_score", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / cardsPerPage)

  // Return pagination metadata along with data
  return NextResponse.json({
    startups: data,
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: cardsPerPage, // UI pagination size
    apiLimit: limit, // API batch size,
    timeTaken: new Date().getTime() - new Date().getTime(),
  }, {
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    },
  })
}
