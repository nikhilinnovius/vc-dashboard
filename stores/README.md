# Global Data Stores

This directory contains three global data stores built with Zustand for managing application state:

## Stores Overview

### 1. `useVcStore` - VC Data Management
Manages venture capital firms data with full CRUD operations and search capabilities.

### 2. `useStartupStore` - Startup/Company Data Management  
Manages startup/company data with comprehensive filtering and search functionality.

### 3. `useSearchPool` - Unified Search Store
Combines VCs and Companies into a unified search pool with the `SearchItem` interface.

## Usage Examples

### Basic Store Usage

```typescript
import { useVcStore, useStartupStore, useSearchPool } from '@/stores'

// In a React component
function MyComponent() {
  const { vcs, fetchVcs, isLoading } = useVcStore()
  const { startups, fetchStartups } = useStartupStore()
  const { searchPool, initializePool } = useSearchPool()
  
  useEffect(() => {
    // Fetch data on mount
    fetchVcs()
    fetchStartups()
  }, [])
  
  useEffect(() => {
    // Initialize search pool after data is loaded
    if (vcs.length > 0 || startups.length > 0) {
      initializePool()
    }
  }, [vcs.length, startups.length])
  
  return (
    <div>
      <p>VCs: {vcs.length}</p>
      <p>Startups: {startups.length}</p>
      <p>Search Pool: {searchPool.length}</p>
    </div>
  )
}
```

### Using Search Pool with Auto-Sync

```typescript
import { useSearchPoolSync, useGlobalSearch } from '@/stores'

function SearchComponent() {
  // Auto-syncs search pool when underlying data changes
  const { searchItems, isInitialized } = useSearchPoolSync()
  
  // Global search utilities
  const { search, searchByLocation, findById } = useGlobalSearch()
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  
  useEffect(() => {
    if (query && isInitialized) {
      const searchResults = search(query)
      setResults(searchResults)
    }
  }, [query, isInitialized])
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search VCs and Companies..."
      />
      {results.map(item => (
        <div key={`${item.entityType}-${item.id}`}>
          <strong>{item.name}</strong> ({item.entityType})
          <br />
          {item.city}, {item.state}
        </div>
      ))}
    </div>
  )
}
```

### Advanced Filtering

```typescript
import { useVcStore, useStartupStore } from '@/stores'

function FilteredView() {
  const { getVcsByLocation, searchVcs } = useVcStore()
  const { getStartupsByEndMarket, getStartupsByStatus } = useStartupStore()
  
  // Get VCs in California
  const californiaVCs = getVcsByLocation(undefined, 'California')
  
  // Get AI startups
  const aiStartups = getStartupsByEndMarket('AI')
  
  // Get active startups
  const activeStartups = getStartupsByStatus('Active')
  
  return (
    <div>
      <h3>California VCs: {californiaVCs.length}</h3>
      <h3>AI Startups: {aiStartups.length}</h3>
      <h3>Active Startups: {activeStartups.length}</h3>
    </div>
  )
}
```

## Store Features

### VcStore Features
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Location-based filtering
- ✅ Text search across multiple fields
- ✅ Loading states and error handling
- ✅ Metadata tracking (total items, pages)
- ✅ DevTools integration

### StartupStore Features
- ✅ Full CRUD operations with flexible identifier matching
- ✅ Location, end market, and status filtering
- ✅ VC portfolio association
- ✅ Comprehensive search across all fields
- ✅ Loading states and error handling
- ✅ DevTools integration

### SearchPool Features
- ✅ Unified search across VCs and Companies
- ✅ Auto-sync with underlying stores
- ✅ Entity type filtering
- ✅ Location-based search
- ✅ Consistent SearchItem interface
- ✅ Performance optimized

## SearchItem Interface

```typescript
interface SearchItem {
  entityType: "vc" | "company"
  id: string
  name: string
  website: string | null
  city: string | null
  state: string | null
}
```

This interface provides a unified way to work with both VCs and Companies in search contexts.

## Performance Notes

- All stores use Zustand's devtools middleware for debugging
- Search operations are optimized with lowercase matching
- Data is cached in memory with timestamp tracking
- Search pool automatically syncs when underlying data changes
- All operations are immutable and React-friendly
