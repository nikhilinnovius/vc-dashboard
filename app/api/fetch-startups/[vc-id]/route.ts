// This is the API to fetch the startups for a specific VC
// Given a VC ID, it will fetch the startups for that VC using supabase
// There is a table called vc_company_relations which has the vc_id and the company_id as foreign keys
// We will use the vc_id to fetch the startups for that VC

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request, { params }: { params: { "vc-id": string } }) {
  const supabase = await createClient()
  const vcId = params["vc-id"]
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") ?? "1")
  const limit = 200 // VCs loaded per API call (10 pages worth)
  const offset = (page - 1) * limit

  let { data: companyIds, error: companyIdsError } = await supabase
    .from("vc_company_relations")
    .select("company_id")
    .eq("vc_id", vcId)
    .range(offset, offset + limit - 1)
    
    companyIds = companyIds?.map((company) => company.company_id) || []

  if (companyIdsError) {
    return NextResponse.json({ error: companyIdsError.message }, { status: 500 })
  }

  let { data, error } = await supabase
    .from("companies")
    .select("*")
    .in("id", companyIds)
    .order("company_score", { ascending: false })

  return NextResponse.json({ startups: data, error, numberOfStartups: data?.length || 0 })
}