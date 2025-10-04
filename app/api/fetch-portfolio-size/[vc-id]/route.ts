// Given a VC ID, this route will fetch the number of portfolio companies for that VC

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request, { params }: { params: { "vc-id": string } }) {
  const supabase = await createClient()
  const vcId = params["vc-id"]

  try {
    // First, get the total count of all portfolio companies for this VC
    const { count: totalCount, error: countError } = await supabase
      .from("vc_company_relations")
      .select("company_id", { count: "exact", head: true })
      .eq("vc_id", vcId)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }
    return NextResponse.json({ portfolioSize: totalCount })
  } catch (error) {
    console.error('Error fetching portfolio size:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch portfolio size' }, { status: 500 })
  }
}