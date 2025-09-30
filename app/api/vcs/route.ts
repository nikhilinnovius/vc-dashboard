import { type NextRequest, NextResponse } from "next/server"
import { getPaginatedVCs } from "@/lib/data-utils"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const filterType = searchParams.get("filterType") as "state" | "city" | null
    const location = searchParams.get("location")

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 })
    }

    const result = await getPaginatedVCs({
      page,
      limit,
      filterType,
      location,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in /api/vcs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
