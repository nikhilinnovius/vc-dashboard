import { type NextRequest, NextResponse } from "next/server"
import { getOrganizationByDomain, getOrganizationByName, getNotes, createNote } from "@/lib/affinity-api"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const domain = searchParams.get("domain")
    const name = searchParams.get("name")

    if (!domain && !name) {
      return NextResponse.json({ error: "Domain or name parameter is required" }, { status: 400 })
    }

    let organization = null

    // ALWAYS prioritize domain-based lookup
    if (domain) {
      console.log("Looking up organization by domain:", domain)
      organization = await getOrganizationByDomain(domain, userEmail)
    }

    // Only fall back to name-based lookup if domain lookup fails
    if (!organization && name) {
      console.log("Looking up organization by name first:", name)
      organization = await getOrganizationByName(name, userEmail)
    }

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    console.log("Organization found:", organization.id, organization.name)

    // Get notes with creator information
    const notes = await getNotes(organization.id, userEmail)
    console.log("Retrieved notes count:", notes.length)

    // The notes should now include author information from the updated getNotes function
    return NextResponse.json({
      notes,
      organization_id: organization.id,
      organization,
    })
  } catch (error) {
    console.error("Error in GET /api/affinity/notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email
    const { organization_id, content, domain, name } = await request.json()

    let organizationId = organization_id

    // If organization_id is not provided, try to find the organization
    if (!organizationId) {
      let organization = null

      // ALWAYS prioritize domain-based lookup
      if (domain) {
        console.log("Looking up organization by domain for POST:", domain)
        organization = await getOrganizationByDomain(domain, userEmail)
      }

      // Only fall back to name-based lookup if domain lookup fails
      if (!organization && name) {
        console.log("Looking up organization by name for POST:", name)
        organization = await getOrganizationByName(name, userEmail)
      }

      if (!organization) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 })
      }

      organizationId = organization.id
      console.log("Organization found for POST:", organizationId, organization.name)
    }

    const note = await createNote(organizationId, content, userEmail)
    return NextResponse.json(note)
  } catch (error) {
    console.error("Error in POST /api/affinity/notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
