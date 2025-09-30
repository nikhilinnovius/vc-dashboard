// Search index utilities for optimized searching
export interface SearchableItem {
  id: string
  name: string
  city: string
  state: string
  type: "vc" | "startup"
  searchTerms: string[]
  originalData: any
  // Add domain field for startup identity
  domain?: string
}

export class SearchIndex {
  private index: Map<string, SearchableItem[]> = new Map()
  private items: SearchableItem[] = []
  private isBuilt = false

  constructor() {
    this.index = new Map()
    this.items = []
  }

  // Build the search index from VCs and startups
  buildIndex(vcs: any[], startups: any[]) {
    console.log("Building search index...")
    const startTime = performance.now()

    this.items = []
    this.index.clear()

    // Process VCs
    vcs.forEach((vc) => {
      if (!vc?.name) return

      const searchTerms = this.generateSearchTerms(vc.name, vc.city, vc.state)
      const item: SearchableItem = {
        id: vc.id || `vc-${vc.name}`,
        name: vc.name,
        city: vc.city || "",
        state: vc.state || "",
        type: "vc",
        searchTerms,
        originalData: vc,
      }

      this.items.push(item)
      this.addToIndex(item, searchTerms)
    })

    // Process startups (deduplicated)
    const uniqueStartups = new Map()
    startups.forEach((startup) => {
      if (!startup?.name) return
      
      // Use domain as the unique identifier for startups, fallback to name if no domain
      const uniqueKey = startup.domain || startup.website || startup.name
      if (uniqueStartups.has(uniqueKey)) return
      uniqueStartups.set(uniqueKey, startup)

      const searchTerms = this.generateSearchTerms(startup.name, startup.city, startup.state)
      const item: SearchableItem = {
        // Use domain-based ID for consistent routing
        id: startup.domain || startup.website || `startup-${startup.name}`,
        name: startup.name,
        city: startup.city || "",
        state: startup.state || "",
        type: "startup",
        searchTerms,
        originalData: startup,
        domain: startup.domain || startup.website, // Store domain for display
      }

      this.items.push(item)
      this.addToIndex(item, searchTerms)
    })

    this.isBuilt = true
    const endTime = performance.now()
    console.log(`Search index built in ${(endTime - startTime).toFixed(2)}ms with ${this.items.length} items`)
  }

  private generateSearchTerms(name: string, city: string, state: string): string[] {
    const terms = new Set<string>()

    // Add full terms
    if (name) terms.add(name.toLowerCase().trim())
    if (city) terms.add(city.toLowerCase().trim())
    if (state) terms.add(state.toLowerCase().trim())

    // Add word-level terms for better matching
    if (name) {
      name
        .toLowerCase()
        .split(/\s+/)
        .forEach((word) => {
          if (word.length > 1) terms.add(word)
        })
    }

    // Add prefix terms for autocomplete-style matching
    if (name) {
      const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, "")
      for (let i = 2; i <= Math.min(cleanName.length, 10); i++) {
        terms.add(cleanName.substring(0, i))
      }
    }

    return Array.from(terms)
  }

  private addToIndex(item: SearchableItem, searchTerms: string[]) {
    searchTerms.forEach((term) => {
      if (!this.index.has(term)) {
        this.index.set(term, [])
      }
      this.index.get(term)!.push(item)
    })
  }

  // Fast search using the pre-built index
  search(query: string, limit = 20): SearchableItem[] {
    if (!this.isBuilt || !query.trim()) {
      // Return top items when no query
      return this.items.slice(0, limit)
    }

    const normalizedQuery = query.toLowerCase().trim()
    const results = new Map<string, { item: SearchableItem; score: number }>()

    // Direct index lookup for exact matches
    const exactMatches = this.index.get(normalizedQuery) || []
    exactMatches.forEach((item) => {
      results.set(item.id, { item, score: 100 })
    })

    // Prefix matching for partial queries
    for (const [term, items] of this.index.entries()) {
      if (term.startsWith(normalizedQuery)) {
        items.forEach((item) => {
          const existing = results.get(item.id)
          const score = term === normalizedQuery ? 100 : 80 - (term.length - normalizedQuery.length)

          if (!existing || existing.score < score) {
            results.set(item.id, { item, score })
          }
        })
      }
    }

    // Fallback: contains matching for broader results
    if (results.size < limit) {
      for (const [term, items] of this.index.entries()) {
        if (term.includes(normalizedQuery) && !term.startsWith(normalizedQuery)) {
          items.forEach((item) => {
            if (!results.has(item.id)) {
              results.set(item.id, { item, score: 60 })
            }
          })
        }
      }
    }

    // Sort by score and return
    return Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((result) => result.item)
  }

  isIndexBuilt(): boolean {
    return this.isBuilt
  }

  getStats() {
    return {
      totalItems: this.items.length,
      indexSize: this.index.size,
      isBuilt: this.isBuilt,
    }
  }
}

// Singleton instance
let searchIndexInstance: SearchIndex | null = null

export function getSearchIndex(): SearchIndex {
  if (!searchIndexInstance) {
    searchIndexInstance = new SearchIndex()
  }
  return searchIndexInstance
}
