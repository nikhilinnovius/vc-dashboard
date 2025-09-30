import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getOrganizationByDomain, getOrganizationDetails, getPersonDetails } from "@/lib/affinity-api"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get domain from query params
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get("domain")

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Get organization ID from domain using the user's email for API key lookup
    const organization = await getOrganizationByDomain(domain, session.user.email)
    if (!organization) {
      return NextResponse.json({
        people: [{ name: "Not Available", email: "Not Available" }],
      })
    }

    // Get organization details including person IDs
    const orgDetails = await getOrganizationDetails(organization.id, session.user.email)
    if (!orgDetails || !orgDetails.person_ids || orgDetails.person_ids.length === 0) {
      return NextResponse.json({
        people: [{ name: "Not Available", email: "Not Available" }],
      })
    }

    // Get details for each person
    const people = await Promise.all(
      orgDetails.person_ids.map(async (personId: number) => {
        const person = await getPersonDetails(personId, session.user.email)
        if (!person) return null

        const firstName = (person.first_name || "").trim()
        const lastName = (person.last_name || "").trim()
        const fullName = `${firstName} ${lastName}`.trim()
        const email = (person.primary_email || "Not Available").trim()

        return {
          id: person.id,
          name: fullName || "Not Available",
          email: email || "Not Available",
          title: person.title || null,
          linkedin: person.linkedin_url || null,
        }
      }),
    )

    // Filter out null values and return
    const validPeople = people.filter(Boolean)

    return NextResponse.json({
      organization_id: organization.id,
      organization_name: organization.name,
      people: validPeople.length > 0 ? validPeople : [{ name: "Not Available", email: "Not Available" }],
    })
  } catch (error) {
    console.error("Error fetching people:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch people",
        message: error instanceof Error ? error.message : String(error),
        people: [{ name: "Not Available", email: "Not Available" }],
      },
      { status: 500 },
    )
  }
}
