// app/api/vcs/saved-details/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { fetchCSVData } from "@/lib/data-utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Get the session to ensure user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's saved VC IDs from the saved VCs API
    const savedResponse = await fetch(`${request.nextUrl.origin}/api/vcs/saved`, {
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    })

    if (!savedResponse.ok) {
      return NextResponse.json({ vcs: [] })
    }

    const { savedVCs } = await savedResponse.json()
    const uniqueSavedVCs = [...new Set(savedVCs)]

    if (!uniqueSavedVCs || uniqueSavedVCs.length === 0) {
      return NextResponse.json({ vcs: [] })
    }

    // Fetch all VC data from server
    const csvData = await fetchCSVData()

    // 🔥 FIX: Filter by VC ID instead of VC name
    const savedVCsData = csvData.vcs.filter((vc) => uniqueSavedVCs.includes(vc.id))
    
    // Debug logging
    console.log("Saved VC IDs from KV:", savedVCs)
    console.log("Found matching VCs:", savedVCsData.map(vc => ({ id: vc.id, name: vc.name })))

    return NextResponse.json({ vcs: savedVCsData })
  } catch (error) {
    console.error("Error fetching saved VCs details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
