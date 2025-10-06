import { type NextRequest, NextResponse } from "next/server"
import { getOrganizationByDomain, getOrganizationByName, getNotes, createNote } from "@/lib/affinity-api"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/auth"
import { getEnvironment } from "@/middleware"


// fetch notes
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    console.log("User:", user)
    const userEmail = user?.email

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

// create note
export async function POST(request: NextRequest) {
  try {
    const environment = getEnvironment() 
    let user = null
    if (environment === 'development') {
      user = {
        email: 'test@example.com',
        name: 'Test User'
      }
    } else {
      user = await getCurrentUser()
    }
  
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = user.email
    const { organization_id, content, domain, name } = await request.json()

    console.log("POST request data:", { organization_id, content, domain, name, userEmail })

    let organizationId = organization_id

    // If organization_id is not provided or is null/empty, try to find the organization
    if (!organizationId || organizationId === "" || organizationId === null || organizationId === undefined) {
      let organization = null

      // ALWAYS prioritize domain-based lookup
      if (domain) {
        console.log("Looking up organization by domain for POST:", domain)
        try {
          organization = await getOrganizationByDomain(domain, userEmail)
        } catch (error) {
          console.error("Error looking up organization by domain:", error)
        }
      }

      // Only fall back to name-based lookup if domain lookup fails
      if (!organization && name) {
        console.log("Looking up organization by name for POST:", name)
        try {
          organization = await getOrganizationByName(name, userEmail)
        } catch (error) {
          console.error("Error looking up organization by name:", error)
        }
      }

      if (!organization) {
        console.error("No organization found for domain:", domain, "name:", name)
        return NextResponse.json({ 
          error: "Organization not found", 
          details: `No organization found for domain: ${domain}, name: ${name}` 
        }, { status: 404 })
      }

      organizationId = organization.id
      console.log("Organization found for POST:", organizationId, organization.name)
    }

    console.log("Creating note for organization:", organizationId, "with content:", content)
    const note = await createNote(organizationId, content, userEmail)
    console.log("Note created successfully:", note)
    return NextResponse.json(note)
  } catch (error) {
    console.error("Error in POST /api/affinity/notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
