import { VentureData, StartupData } from './data-utils'

/**
 * Transforms raw Supabase VC data to match the VentureData interface
 * This handles field mapping from database schema to frontend types
 */
export function transformToVentureData(rawVC: any): VentureData {
  return {
    id: rawVC.id,
    name: rawVC.name,
    city: rawVC.city,
    state: rawVC.state,
    website: rawVC.website,
    description: rawVC.description,
    logo: rawVC.logo || "/placeholder.svg", // Default to placeholder if not present
    vcScore: rawVC.vc_score, // Map vc_score to vcScore
    aum: rawVC.aum,
    stageDistribution: rawVC.stage_distribution, // Map stage_distribution to stageDistribution
    inAffinity: rawVC.in_affinity || false, // Default to false if not present
    numberOfPortfolioCompanies: rawVC.number_of_portfolio_companies || 0, // Default to 0 if not present
  }
}

export function transformToStartupData(rawStartup: any): StartupData {
  return {
    id: rawStartup.id,
    name: rawStartup.name,
    website: rawStartup.website ?? undefined,
    city: rawStartup.city ?? undefined,
    state: rawStartup.state ?? undefined,
    description: rawStartup.description ?? undefined,
    linkedin: rawStartup.linkedin ?? undefined,
    foundedDate: rawStartup.founded_date ?? undefined,
    companyStatus: rawStartup.company_status ?? undefined,
    companyScore: rawStartup.company_score ?? undefined,
    scoreReasoning: rawStartup.score_reasoning ?? undefined,
    flaggedByInternalAndExternal: rawStartup.flagged_by_internal_and_external ?? undefined,
    mostRecentFunding: rawStartup.most_recent_funding ?? undefined,
    lastFundingAmount: rawStartup.last_funding_amount ?? undefined,
    totalRaised: rawStartup.total_raised ?? undefined,
    currentInvestors: rawStartup.current_investors ?? [],
    ceoLinkedin: rawStartup.ceo_linkedin ?? undefined,
    endMarket: rawStartup.end_market ?? undefined,
    businessModel: rawStartup.business_model ?? undefined,
    subVertical: rawStartup.sub_vertical ?? undefined,
    totalEmployees: rawStartup.total_employees ?? undefined,
    lastRound: rawStartup.last_round ?? undefined,
    innoviusCoverage: rawStartup.innovius_coverage ?? undefined,
    headcount180dPct: rawStartup.headcount_180d_pct ?? undefined,
    headcount1yPct: rawStartup.headcount_1y_pct ?? undefined,
    sales1yPct: rawStartup.sales_1y_pct ?? undefined,
    webTraffic1yPct: rawStartup.web_traffic_1y_pct ?? undefined,
    webTraffic180dPct: rawStartup.web_traffic_180d_pct ?? undefined,
    sales180dPct: rawStartup.sales_180d_pct ?? undefined,
    innoviusConnected: rawStartup.innovius_connected ?? false,
    excitement: rawStartup.excitement ?? undefined,
    expectedRaise: rawStartup.expected_raise ?? undefined,
    conferences: rawStartup.conferences ?? undefined,
    offshoreData: rawStartup.offshore_data ?? undefined,
    innoviusInvestorConnections: rawStartup.innovius_investor_connections ?? undefined,
    raisePredictor: rawStartup.raise_predictor ?? undefined,
    inAffinity: rawStartup.in_affinity ?? false,
    organizationId: rawStartup.organization_id ?? undefined,
    workflowTriggers: rawStartup.workflow_triggers ?? undefined,
  }
}

export function transformNonQualifiedStartupData(rawStartup: any): StartupData {
  return {
    id: rawStartup.id,
    name: rawStartup.name,
    website: rawStartup.website ?? undefined,
    companyScore: rawStartup.company_score ?? undefined,
    lastRound: rawStartup.last_funding_type ?? undefined,
    city: rawStartup.city ?? undefined,
    description: rawStartup.description ?? undefined,
    totalRaised: rawStartup.total_raised ?? undefined,
    inAffinity: false, // Non-qualified startups are not in Affinity
    linkedin: rawStartup.linkedin ?? undefined,
  }
}



/**
 * Transforms an array of raw Supabase VC data
 */
export function transformToVentureDataArray(rawVCs: any[]): VentureData[] {
  return rawVCs.map(transformToVentureData)
}
