// Round mapping utility - shared between client and server
export const frontendToBackendRoundMap: Record<string, string> = {
  "Pre-Seed": "PRE_SEED",
  "Seed": "SEED",
  "Series A": "SERIES_A",
  "Series B": "SERIES_B",
  "Series C": "SERIES_C",
  "Series D": "SERIES_D"
}

export const backendToFrontendRoundMap: Record<string, string> = {
  "PRE_SEED": "Pre-Seed",
  "SEED": "Seed",
  "SERIES_A": "Series A",
  "SERIES_B": "Series B",
  "SERIES_C": "Series C",
  "SERIES_D": "Series D"
}
