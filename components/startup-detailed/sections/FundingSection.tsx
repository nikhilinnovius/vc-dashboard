import { DollarSign } from "lucide-react"
import { SectionHeader } from "../SectionHeader"
import { formatNumber } from "@/utils/startup-utils"
import { StartupData } from "@/types/startup"
import { LAST_FUNDING_LABELS } from "@/components/vc-dashboard/core/StartupCard"


interface FundingSectionProps {
 data: StartupData
}


export function FundingSection({ data }: FundingSectionProps) {
 const hasFundingData = data.lastRound || data.lastFundingAmount || data.totalRaised


 if (!hasFundingData) return null


 return (
   <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
     <SectionHeader icon={<DollarSign className="h-5 w-5 text-white" />} title="Funding Information" />
     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
       {data.lastRound && (
         <div className="bg-white/5 p-3 rounded-lg">
           <div className="text-sm text-white/60 mb-1">Last Round</div>
           <div className="text-lg font-medium text-white">
             {data.lastRound}
             {data.recentFunding && (
               <span className="text-sm font-normal text-white/60 ml-1">
                 {LAST_FUNDING_LABELS[data.recentFunding]}
               </span>
             )}
           </div>
         </div>
       )}


       {data.lastFundingAmount && (
         <div className="bg-white/5 p-3 rounded-lg">
           <div className="text-sm text-white/60 mb-1">Last Funding</div>
           <div className="text-lg font-medium text-white">
             ${formatNumber(data.lastFundingAmount)}
           </div>
         </div>
       )}


       {data.totalRaised && (
         <div className="bg-white/5 p-3 rounded-lg">
           <div className="text-sm text-white/60 mb-1">Total Raised</div>
           <div className="text-lg font-medium text-white">
             ${formatNumber(data.totalRaised)}
           </div>
         </div>
       )}
     </div>
   </section>
 )
}




