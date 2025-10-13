// Comprehensive startup data types

export interface StartupData {
  // Basic Info
  name: string
  website: string
  linkedin?: string
  city: string
  state: string
  domain?: string
  
  // Status & Scoring
  status?: string
  companyScore?: string
  companyStatus?: string
  raisePredictor?: string
  scoreReasoning?: string
  
  // Funding Information
  lastRound?: string
  lastFundingAmount?: string
  totalRaised?: string
  recentFunding?: string
  expectedRaise?: string
  
  // Company Details
  foundedDate?: string
  startupTotalEmployees?: string
  summary?: string
  businessModel?: string
  endMarket?: string
  subVertical?: string
  
  // Leadership
  ceoLinkedin?: string
  
  // Connections & Coverage
  flaggedBy?: string
  currentInvestors?: string
  innoviusInvestorConnections?: string
  innoviusCoverage?: string
  startupExcitement?: string
  connectedWithCompany?: string
  
  // Growth Metrics
  headcount180d?: string
  headcount1y?: string
  sales1y?: string
  webTraffic1y?: string
  webTraffic180d?: string
  salesGrowth180d?: string
  
  // Additional
  conferences?: string
  vcId?: string
}

export interface StartupDetailsProps {
  startupId: string // domain or name as fallback
  onBack?: (vcName?: string) => void
}

export interface GrowthStatus {
  positive?: boolean
  negative?: boolean
}


  