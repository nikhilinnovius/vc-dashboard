import React from 'react'
import { Button } from "@/components/ui/button"
import { FileText, Filter } from "lucide-react"
import { CompanyLogo } from "@/components/vc-dashboard/core/OrgIcon"
import { SaveButton } from "@/components/SaveButton"
import { GiveawayPopup } from "@/components/giveaway-popup"
import { PortfolioSearch } from "@/components/portfolio-search"
import { StageDistributionPills } from "@/components/stage-distribution-pills"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getGiveawayDataForVC } from "@/lib/data-utils"
import { formatPortfolioScore, formatAUM, generateVCId } from "@/utils/string-utils"

interface PortfolioControlsProps {
  selectedVC: string
  vcData: any
  startupCount: number
  savedVCs: string[]
  lastRoundFilter: string | null
  statusFilter: string | null
  endMarketFilters: string[]
  giveawayData: any[]
  onBack: () => void
  onStartupSelect: (startup: string, fromSearch?: boolean) => void
  onSaveChange: (vcId: string, saved: boolean) => void
  onNoteOpen: () => void
  onLastRoundFilterChange: (filter: string | null) => void
  onStatusFilterChange: (filter: string | null) => void
  onEndMarketFiltersChange: (filters: string[]) => void
  getUniqueLastRounds: (vcId: string) => string[]
  getUniqueStatuses: (vcId: string) => string[]
  getUniqueEndMarkets: (vcId: string) => string[]
}

export const PortfolioControls: React.FC<PortfolioControlsProps> = ({
  selectedVC,
  vcData,
  startupCount,
  savedVCs,
  lastRoundFilter,
  statusFilter,
  endMarketFilters,
  giveawayData,
  onBack,
  onStartupSelect,
  onSaveChange,
  onNoteOpen,
  onLastRoundFilterChange,
  onStatusFilterChange,
  onEndMarketFiltersChange,
  getUniqueLastRounds,
  getUniqueStatuses,
  getUniqueEndMarkets,
}) => {
  const vcId = generateVCId(selectedVC)

  return (
    <>
      {/* Back Button */}
      <div className="mb-4 mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-white/10 text-white hover:bg-white/20 border-white/20"
        >
          ← Back to VCs
        </Button>
      </div>

      {/* VC Header */}
      <div className="mb-6 mt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {vcData?.website ? (
                <a
                  href={vcData.website.startsWith("http") ? vcData.website : `https://${vcData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  title={`Visit ${selectedVC} website`}
                >
                  <CompanyLogo
                    domain={vcData.website}
                    name={selectedVC}
                    size={48}
                    type="vc"
                    className="flex-shrink-0"
                  />
                </a>
              ) : (
                <CompanyLogo
                  domain=""
                  name={selectedVC}
                  size={48}
                  type="vc"
                  className="flex-shrink-0"
                />
              )}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white break-words">
                {selectedVC} Portfolio
              </h2>
              {startupCount > 0 && (
                <div className="flex items-center gap-3 text-base font-normal text-white/60">
                  {vcData?.portfolioCompanyScore && (
                    <>
                      <span>{formatPortfolioScore(vcData.portfolioCompanyScore)}</span>
                      <span className="text-white/40">|</span>
                    </>
                  )}
                  <span>
                    {startupCount} {startupCount === 1 ? "startup" : "startups"}
                  </span>
                  {vcData?.aum && (
                    <>
                      <span className="text-white/40">|</span>
                      <span>{formatAUM(vcData.aum)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onNoteOpen()
              }}
              className="bg-white/20 hover:bg-white/30 text-white h-10 w-10"
            >
              <FileText className="h-5 w-5" />
            </Button>

            <SaveButton
              itemId={vcData?.id || ""}
              itemType="vc"
              initialSaved={savedVCs.includes(vcData?.id || "")}
              onSaveChange={(saved) => {
                if (vcData?.id) onSaveChange(vcData.id, saved)
              }}
              className="bg-white/20 hover:bg-white/30 transition-colors duration-200"
            />

            {selectedVC && (
              <GiveawayPopup
                vcData={getGiveawayDataForVC(giveawayData, vcData?.website || "")}
                vcName={selectedVC}
                vcWebsite={vcData?.website || ""}
              />
            )}

            <PortfolioSearch
              vcId={vcId}
              onStartupSelect={onStartupSelect}
              onScrollToStartup={(startupId) => {
                const element = document.getElementById(startupId)
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "center" })
                  element.classList.add("ring-4", "ring-blue-500", "ring-opacity-50")
                  setTimeout(() => {
                    element.classList.remove("ring-4", "ring-blue-500", "ring-opacity-50")
                  }, 2000)
                }
              }}
            />

            {/* Filter Dropdowns */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`bg-white/10 text-white hover:bg-white/20 border-white/20 ${lastRoundFilter ? "ring-2 ring-blue-500" : ""}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {lastRoundFilter ? `Round: ${lastRoundFilter}` : "Filter Rounds"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Last Round</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {getUniqueLastRounds(vcId).map((round) => (
                  <DropdownMenuItem
                    key={round}
                    onClick={() => {
                      onLastRoundFilterChange(null)
                      setTimeout(() => {
                        onLastRoundFilterChange(round)
                      }, 10)
                    }}
                    className={lastRoundFilter === round ? "bg-blue-50 text-blue-600 font-medium" : ""}
                  >
                    {round}
                  </DropdownMenuItem>
                ))}
                {lastRoundFilter && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onLastRoundFilterChange(null)}>
                      Clear Filter
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`bg-white/10 text-white hover:bg-white/20 border-white/20 ${statusFilter ? "ring-2 ring-green-500" : ""}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {statusFilter ? `Status: ${statusFilter}` : "Filter Status"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {getUniqueStatuses(vcId).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => {
                      onStatusFilterChange(null)
                      setTimeout(() => {
                        onStatusFilterChange(status)
                      }, 10)
                    }}
                    className={statusFilter === status ? "bg-green-50 text-green-600 font-medium" : ""}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
                {statusFilter && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onStatusFilterChange(null)}>
                      Clear Filter
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`bg-white/10 text-white hover:bg-white/20 border-white/20 ${endMarketFilters.length > 0 ? "ring-2 ring-purple-500" : ""}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {endMarketFilters.length > 0 ? `Markets: ${endMarketFilters.length}` : "Filter Markets"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuLabel>Filter by End Market</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[200px] overflow-y-auto">
                  {getUniqueEndMarkets(vcId).map((market) => (
                    <DropdownMenuCheckboxItem
                      key={market}
                      checked={endMarketFilters.includes(market)}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onEndMarketFiltersChange([...endMarketFilters, market])
                        } else {
                          onEndMarketFiltersChange(endMarketFilters.filter((m) => m !== market))
                        }
                      }}
                    >
                      {market}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                {endMarketFilters.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        onEndMarketFiltersChange([])
                      }}
                    >
                      Clear All Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {vcData?.stageDistribution && (
              <StageDistributionPills stageDistribution={vcData.stageDistribution} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
