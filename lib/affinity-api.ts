import { getUserApiKey } from "@/lib/user-api-keys"

// Helper function to get headers for Affinity API with user-specific key
async function getAffinityHeaders(userEmail?: string) {
  let apiKey: string | undefined

  // If a user email is provided, try to get their specific API key
  if (userEmail) {
    const userData = await getUserApiKey(userEmail)
    if (userData) {
      apiKey = userData.affinityApiKey
    }
  }

  // Fall back to the environment variable if no user-specific key is found
  if (!apiKey) {
    apiKey = process.env.AFFINITY_API_KEY
  }

  if (!apiKey) {
    throw new Error("No Affinity API key available")
  }

  return {
    Authorization: `Basic ${Buffer.from(`:${apiKey}`).toString("base64")}`,
    "Content-Type": "application/json",
  }
}

// Format date from Affinity API
export function formatAffinityDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch (error) {
    return "Unknown date"
  }
}

// Get organization by domain - improved to be more precise
export async function getOrganizationByDomain(domain: string, userEmail?: string) {
  try {
    if (!domain) {
      console.error("Domain is empty or undefined")
      return null
    }

    // Ensure domain is clean
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/i, "").split("/")[0]
    console.log("Searching for organization with domain:", cleanDomain)

    const headers = await getAffinityHeaders(userEmail)

    // First try to get all organizations and filter by domain
    const allOrgsResponse = await fetch(`https://api.affinity.co/organizations`, {
      headers,
    })

    if (allOrgsResponse.ok) {
      const allOrgs = await allOrgsResponse.json()
      const organizations = Array.isArray(allOrgs) ? allOrgs : allOrgs.organizations || []

      // Find exact domain match
      for (const org of organizations) {
        const orgDomains = (org.domains || []).map((d: string) => d.toLowerCase())
        if (orgDomains.includes(cleanDomain.toLowerCase())) {
          console.log("Exact domain match found in all orgs:", org.name, org.id)
          return org
        }
      }

      // If no exact match, try partial domain match
      for (const org of organizations) {
        const orgDomains = (org.domains || []).map((d: string) => d.toLowerCase())
        for (const orgDomain of orgDomains) {
          if (orgDomain.includes(cleanDomain.toLowerCase()) || cleanDomain.toLowerCase().includes(orgDomain)) {
            console.log("Partial domain match found in all orgs:", org.name, org.id)
            return org
          }
        }
      }
    }

    // If no match found in all orgs, try the search endpoint
    const response = await fetch(`https://api.affinity.co/organizations?term=${encodeURIComponent(cleanDomain)}`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Affinity API error: ${response.status}`)
    }

    const data = await response.json()
    const organizations = Array.isArray(data) ? data : data.organizations || []
    console.log(`Found ${organizations.length} organizations for domain search "${cleanDomain}"`)

    // Find organization with matching domain
    for (const org of organizations) {
      const orgDomains = (org.domains || []).map((d: string) => d.toLowerCase())
      if (orgDomains.includes(cleanDomain.toLowerCase())) {
        console.log("Exact domain match found:", org.name, org.id)
        return org
      }
    }

    // If no exact match, try partial domain match
    for (const org of organizations) {
      const orgDomains = (org.domains || []).map((d: string) => d.toLowerCase())
      for (const orgDomain of orgDomains) {
        if (orgDomain.includes(cleanDomain.toLowerCase()) || cleanDomain.toLowerCase().includes(orgDomain)) {
          console.log("Partial domain match found:", org.name, org.id)
          return org
        }
      }
    }

    // If no exact match but we have organizations, return the first one
    if (organizations.length > 0) {
      console.log("No exact domain match, using first result:", organizations[0].name, organizations[0].id)
      return organizations[0]
    }

    console.log("No organizations found for domain:", cleanDomain)
    return null
  } catch (error) {
    console.error("Error fetching organization:", error)
    throw error
  }
}

// Add this new function to fetch person details by ID
export async function getPersonById(personId: number, userEmail?: string) {
  try {
    const headers = await getAffinityHeaders(userEmail)
    const response = await fetch(`https://api.affinity.co/persons/${personId}`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Affinity API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching person ${personId}:`, error)
    return null
  }
}

// Modify the getNotes function to include creator information
export async function getNotes(organizationId: number, userEmail?: string) {
  try {
    console.log(`Getting notes for organization ID: ${organizationId}`)
    const headers = await getAffinityHeaders(userEmail)

    const response = await fetch(`https://api.affinity.co/notes?organization_id=${organizationId}`, {
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Affinity API error: ${response.status}, ${errorText}`)
      throw new Error(`Affinity API error: ${response.status}, ${errorText}`)
    }

    const data = await response.json()
    const notes = Array.isArray(data) ? data : data.notes || []
    console.log(`Retrieved ${notes.length} notes from Affinity API for organization ${organizationId}`)

    // Fetch creator information for each note
    const notesWithCreators = await Promise.all(
      notes.map(async (note: any) => {
        if (note.creator_id) {
          try {
            const creator = await getPersonById(note.creator_id, userEmail)
            if (creator) {
              return {
                ...note,
                author: `${creator.first_name || ""} ${creator.last_name || ""}`.trim() || "Unknown",
              }
            }
          } catch (error) {
            console.error(`Error fetching creator for note ${note.id}:`, error)
          }
        }
        return note
      }),
    )

    return notesWithCreators
  } catch (error) {
    console.error("Error fetching notes:", error)
    throw error
  }
}

// Get person details
export async function getPersonDetails(personId: number, userEmail?: string) {
  try {
    const headers = await getAffinityHeaders(userEmail)
    const response = await fetch(`https://api.affinity.co/persons/${personId}`, {
      headers,
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching person ${personId}:`, error)
    return null
  }
}

// Create a note for an organization
export async function createNote(organizationId: number, content: string, userEmail?: string) {
  try {
    console.log("Creating note with organizationId:", organizationId, "content:", content, "userEmail:", userEmail)
    
    const headers = await getAffinityHeaders(userEmail)
    console.log("Using headers:", headers)
    
    const requestBody = {
      organization_ids: [organizationId],
      content,
    }
    console.log("Request body:", requestBody)
    
    const response = await fetch("https://api.affinity.co/notes", {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Affinity API error response:", errorText)
      throw new Error(`Affinity API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log("Note created successfully:", result)
    return result
  } catch (error) {
    console.error("Error creating note:", error)
    throw error
  }
}

// Update a note
export async function updateNote(noteId: number, content: string, userEmail?: string) {
  try {
    const headers = await getAffinityHeaders(userEmail)
    const response = await fetch(`https://api.affinity.co/notes/${noteId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Affinity API error: ${response.status} ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating note:", error)
    throw error
  }
}

// Delete a note
export async function deleteNote(noteId: number, userEmail?: string) {
  try {
    const headers = await getAffinityHeaders(userEmail)
    const response = await fetch(`https://api.affinity.co/notes/${noteId}`, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Affinity API error: ${response.status} ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting note:", error)
    throw error
  }
}

// Get organization details including person IDs
export async function getOrganizationDetails(organizationId: number, userEmail?: string) {
  try {
    const headers = await getAffinityHeaders(userEmail)
    const response = await fetch(`https://api.affinity.co/organizations/${organizationId}`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Affinity API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching organization details:", error)
    throw error
  }
}

// Get organization by name - improved to be more precise
export async function getOrganizationByName(name: string, userEmail?: string) {
  try {
    const headers = await getAffinityHeaders(userEmail)

    // First try to get all organizations and filter by exact name
    const allOrgsResponse = await fetch(`https://api.affinity.co/organizations`, {
      headers,
    })

    if (allOrgsResponse.ok) {
      const allOrgs = await allOrgsResponse.json()
      const organizations = Array.isArray(allOrgs) ? allOrgs : allOrgs.organizations || []

      // Find exact name match
      for (const org of organizations) {
        if (org.name.toLowerCase() === name.toLowerCase()) {
          console.log("Exact name match found in all orgs:", org.name, org.id)
          return org
        }
      }
    }

    // If no match found in all orgs, try the search endpoint
    const response = await fetch(`https://api.affinity.co/organizations?term=${encodeURIComponent(name)}`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Affinity API error: ${response.status}`)
    }

    const data = await response.json()
    const organizations = Array.isArray(data) ? data : data.organizations || []

    // Find organization with exact name match
    for (const org of organizations) {
      if (org.name.toLowerCase() === name.toLowerCase()) {
        console.log("Exact name match found:", org.name, org.id)
        return org
      }
    }

    // If no exact match, try partial name match
    for (const org of organizations) {
      if (org.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(org.name.toLowerCase())) {
        console.log("Partial name match found:", org.name, org.id)
        return org
      }
    }

    // If still no match but we have organizations, return the first result
    if (organizations.length > 0) {
      console.log("No name match, using first result:", organizations[0].name, organizations[0].id)
      return organizations[0]
    }

    console.log("No organizations found for name:", name)
    return null
  } catch (error) {
    console.error("Error fetching organization by name:", error)
    throw error
  }
}

export { getAffinityHeaders }
