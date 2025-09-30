// This is the API to fetch the startup for a specific startup ID
// Given a startup ID, it will fetch the startup for that ID using supabase

// It will also fetch the vc_id from the vc_company_relations table
// and then fetch the vc for that ID using supabase

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request, { params }: { params: { "startup-id": string } }) {
  const supabase = await createClient()
  const startupId = params["startup-id"]
  let { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", startupId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, error })
}