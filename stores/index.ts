// Global data stores
export { useVcStore } from './useVcStore'
export { useStartupStore, type Startup } from './useStartupStore'

export { 
  useSearchPool, 
  useSearchPoolSync, 
  useGlobalSearch, 
  type SearchItem 
} from './useSearchPool'

// // Re-export for convenience
// export type {
//   SearchItem as GlobalSearchItem,
//   VC as VCType,
//   Startup as StartupType
// } from './useSearchPool'

