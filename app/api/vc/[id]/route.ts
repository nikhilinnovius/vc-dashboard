// This is the API to fetch the VC for a specific VC ID using supabase

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request, { params }: { params: { "id": string } }) {
  const supabase = await createClient()
  const vcId = params["id"]
  let { data, error } = await supabase
    .from("vcs")
    .select("*")
    .eq("id", vcId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, error })
}