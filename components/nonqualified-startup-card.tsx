// "use client"

// import type React from "react"

// import { Card, CardContent } from "@/components/ui/card"
// import { ExternalLink, FileText } from "lucide-react"
// import { CompanyLogo } from "@/components/vc-dashboard/core/OrgIcon"
// import type { NonQualifiedStartupData } from "@/lib/data-utils"
// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { NonQualifiedNotePopup } from "./nonqualified-note-popup"
// import { SaveButton } from "@/components/SaveButton"

// // Update the component props to include isHighlighted and isSaved
// interface NonQualifiedStartupCardProps {
//   startup: NonQualifiedStartupData
//   isHighlighted?: boolean
//   isSaved?: boolean
//   onSaveChange?: (startupId: string, saved: boolean) => void
// }

// // Helper function to determine the color of the raise prediction indicator
// const getRaisePredictionColor = (predictor: string | undefined | null): string => {
//   if (!predictor || predictor.trim() === "") return "bg-gray-500" // Unknown or empty

//   const predictorLower = predictor.toLowerCase().trim()

//   if (
//     predictor === "N/A" ||
//     predictor === "Not Available" ||
//     predictorLower === "n/a" ||
//     predictorLower === "not available"
//   )
//     return "bg-black"
//   if (predictorLower.startsWith("no")) return "bg-red-500"
//   if (predictorLower.startsWith("yes")) return "bg-green-500"
//   if (predictorLower.startsWith("maybe")) return "bg-yellow-500"

//   return "bg-gray-500" // Default for unknown values
// }

// // Helper function to determine the tooltip text for the raise prediction indicator
// const getRaisePredictionTooltip = (predictor: string | undefined | null): string => {
//   if (!predictor || predictor.trim() === "") return "Raise Prediction: Unknown"

//   const predictorLower = predictor.toLowerCase().trim()

//   if (
//     predictor === "N/A" ||
//     predictor === "Not Available" ||
//     predictorLower === "n/a" ||
//     predictorLower === "not available"
//   )
//     return "Raise Prediction: Not Available or N/A"

//   return `Raise Prediction: ${predictor}`
// }

// // Helper function to safely extract and format domain from website URL
// const extractDisplayDomain = (website: string | undefined | null): string => {
//   if (!website || typeof website !== 'string') return ""
  
//   try {
//     // Remove protocol and www prefix, handle edge cases
//     return website.replace(/^https?:\/\/(www\.)?/, "").split('/')[0] || ""
//   } catch {
//     // Fallback for malformed URLs
//     return website.slice(0, 30) + (website.length > 30 ? "..." : "")
//   }
// }

// // Update the function signature to include the new props with default values
// export function NonQualifiedStartupCard({
//   startup,
//   isHighlighted = false,
//   isSaved = false,
//   onSaveChange,
// }: NonQualifiedStartupCardProps) {
//   // Extract domain from website for display with proper error handling
//   const displayDomain = extractDisplayDomain(startup.website)
//   const [isNotePopupOpen, setIsNotePopupOpen] = useState(false)
//   const [localIsSaved, setLocalIsSaved] = useState(isSaved)

//   // Update local state when prop changes
//   useEffect(() => {
//     setLocalIsSaved(isSaved)
//   }, [isSaved])

//   const handleNoteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation()
//     setIsNotePopupOpen(true)
//   }

//   // Safe company score formatting with proper type checking
//   const formatCompanyScore = (score: string | number | undefined | null): string => {
//     if (!score) return ""
    
//     const numScore = typeof score === 'string' ? Number.parseFloat(score) : score
//     return isNaN(numScore) ? String(score) : String(Math.round(numScore))
//   }

//   return (
//     <Card
//       id={startup.id}
//       className={`overflow-hidden transition-all duration-500 rounded-xl ${
//         isHighlighted
//           ? "ring-4 ring-blue-500 shadow-xl shadow-blue-400/50 scale-[1.05] z-20 bg-blue-100 dark:bg-blue-900/40"
//           : localIsSaved
//             ? "bg-emerald-100 border-emerald-400 shadow-md shadow-emerald-300/30 hover:shadow-2xl hover:shadow-blue-900/20 hover:translate-y-[-6px] hover:scale-[1.03] hover:z-10"
//             : "hover:shadow-2xl hover:shadow-blue-900/20 hover:translate-y-[-6px] hover:scale-[1.03] hover:z-10"
//       } h-full relative`}
//       style={{ backgroundColor: isHighlighted ? undefined : localIsSaved ? undefined : "#F5F5F7" }}
//     >
//       <CardContent
//         className={`p-4 sm:p-6 flex flex-col h-full rounded-xl ${isHighlighted ? "bg-blue-100/80 dark:bg-blue-900/30" : ""}`}
//         style={{ backgroundColor: isHighlighted ? undefined : localIsSaved ? undefined : "#F5F5F7" }}
//       >
//         {/* Main container with proper overflow handling */}
//         <div className="flex flex-col h-full min-w-0"> {/* min-w-0 allows flex child to shrink below content size */}
          
//           {/* Action Buttons Section - Positioned above company info */}
//           <div className="flex flex-col w-full mb-3 sm:mb-4">
//             <div className="flex items-center gap-1 mb-2 ml-12 sm:ml-[60px]"> {/* Responsive margin for mobile */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={handleNoteClick}
//                 className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 flex-shrink-0"
//                 aria-label="View startup notes"
//               >
//                 <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
//               </Button>
//               {onSaveChange && (
//                 <SaveButton
//                   itemId={startup.id}
//                   itemType="nonqualified"
//                   initialSaved={localIsSaved}
//                   onSaveChange={(saved) => onSaveChange(startup.id, saved)}
//                   className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
//                 />
//               )}
//             </div>
//           </div>

//           {/* Company Info Section with proper overflow constraints */}
//           <div className="flex items-start gap-3 sm:gap-4 min-w-0"> {/* items-start for better alignment, min-w-0 for overflow */}
            
//             {/* Company Logo - Fixed size to prevent layout shifts */}
//             <div className="flex-shrink-0">
//               <CompanyLogo
//                 domain={startup.website}
//                 name={startup.name}
//                 size={40} // Slightly smaller on mobile
//                 type="startup"
//                 className="sm:w-12 sm:h-12" // Responsive sizing
//               />
//             </div>

//             {/* Company Details - Constrained container to prevent overflow */}
//             <div className="flex flex-col min-w-0 flex-1"> {/* flex-1 takes remaining space, min-w-0 allows shrinking */}
              
//               {/* Company Name with proper text handling */}
//               <h3
//                 className={`text-sm sm:text-base lg:text-lg font-semibold leading-tight mb-1 sm:mb-2 
//                   overflow-hidden text-ellipsis break-words hyphens-auto
//                   ${isHighlighted ? "text-blue-700 dark:text-blue-300" : "text-gray-900"}
//                 `}
//                 style={{
//                   display: '-webkit-box',
//                   WebkitLineClamp: 2, // Limit to 2 lines
//                   WebkitBoxOrient: 'vertical',
//                   wordBreak: 'break-word', // Handle very long words
//                   overflowWrap: 'break-word'
//                 }}
//                 title={startup.name} // Tooltip shows full name on hover
//               >
//                 {startup.name || "Unnamed Company"}
//               </h3>

//               {/* Company Score and Raise Prediction */}
//               {startup.companyScore && (
//                 <div className="flex items-center mb-2 min-w-0"> {/* min-w-0 to allow shrinking */}
//                   <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
//                     Score: {formatCompanyScore(startup.companyScore)}
//                   </span>

//                   {/* Raise Prediction Indicator with responsive sizing */}
//                   <div className="ml-2 relative group inline-flex items-center flex-shrink-0">
//                     <div
//                       className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${getRaisePredictionColor(startup.raisePredictor)}`}
//                       aria-label="Raise Prediction Indicator"
//                     />
//                     {/* Tooltip with proper positioning and z-index */}
//                     <div className="absolute z-50 invisible group-hover:visible bg-black text-white text-xs rounded py-1 px-2 
//                       left-1/2 transform -translate-x-1/2 bottom-full mb-2 whitespace-nowrap pointer-events-none
//                       before:content-[''] before:absolute before:top-full before:left-1/2 before:transform before:-translate-x-1/2
//                       before:border-4 before:border-transparent before:border-t-black">
//                       {getRaisePredictionTooltip(startup.raisePredictor)}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Website Link with proper overflow handling */}
//               {startup.website && displayDomain && (
//                 <div className="min-w-0"> {/* Container to constrain link width */}
//                   <a
//                     href={startup.website.startsWith("http") ? startup.website : `https://${startup.website}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center text-xs sm:text-sm text-blue-500 hover:text-blue-600 
//                       transition-colors duration-200 max-w-full group"
//                     onClick={(e) => e.stopPropagation()}
//                     title={`Visit ${displayDomain}`} // Tooltip for accessibility
//                   >
//                     {/* Domain text with proper truncation */}
//                     <span className="truncate max-w-[140px] sm:max-w-[180px] lg:max-w-[220px]">
//                       {displayDomain}
//                     </span>
//                     <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Notes Popup - Rendered conditionally */}
//         {isNotePopupOpen && (
//           <NonQualifiedNotePopup 
//             startup={startup} 
//             isOpen={isNotePopupOpen} 
//             onClose={() => setIsNotePopupOpen(false)} 
//           />
//         )}
//       </CardContent>
//     </Card>
//   )
// }
