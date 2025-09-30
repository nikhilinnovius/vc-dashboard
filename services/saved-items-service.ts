interface SaveItemRequest {
  id: string
}

interface SaveItemResponse {
  success: boolean
  message?: string
}

export class SavedItemsService {
  static async saveVC(vcId: string): Promise<SaveItemResponse> {
    try {
      const response = await fetch("/api/vcs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vcId }),
      })
      
      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, message: "Failed to save VC" }
      }
    } catch (error) {
      console.error("Failed to save VC:", error)
      return { success: false, message: "Network error" }
    }
  }

  static async unsaveVC(vcId: string): Promise<SaveItemResponse> {
    try {
      const response = await fetch("/api/vcs/unsave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vcId }),
      })
      
      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, message: "Failed to unsave VC" }
      }
    } catch (error) {
      console.error("Failed to unsave VC:", error)
      return { success: false, message: "Network error" }
    }
  }

  static async saveStartup(startupName: string): Promise<SaveItemResponse> {
    try {
      const response = await fetch("/api/startups/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: startupName }),
      })
      
      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, message: "Failed to save startup" }
      }
    } catch (error) {
      console.error("Failed to save startup:", error)
      return { success: false, message: "Network error" }
    }
  }

  static async unsaveStartup(startupName: string): Promise<SaveItemResponse> {
    try {
      const response = await fetch("/api/startups/unsave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: startupName }),
      })
      
      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, message: "Failed to unsave startup" }
      }
    } catch (error) {
      console.error("Failed to unsave startup:", error)
      return { success: false, message: "Network error" }
    }
  }

  static async fetchSavedVCs(): Promise<string[]> {
    try {
      const response = await fetch("/api/vcs/saved", {
        cache: "force-cache",
        next: { revalidate: 60 },
      })
      
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data.savedVCs) ? data.savedVCs : []
      }
      return []
    } catch (error) {
      console.error("Failed to fetch saved VCs:", error)
      return []
    }
  }

  static async fetchSavedStartups(): Promise<string[]> {
    try {
      const response = await fetch("/api/startups/saved", {
        cache: "force-cache",
        next: { revalidate: 60 },
      })
      
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data.savedStartups) ? data.savedStartups : []
      }
      return []
    } catch (error) {
      console.error("Failed to fetch saved startups:", error)
      return []
    }
  }
}
