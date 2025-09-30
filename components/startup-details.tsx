// "use client"

// import type React from "react"

// import { useState, useEffect, useMemo } from "react"
// import {
//   ArrowLeft,
//   Linkedin,
//   DollarSign,
//   User,
//   Edit2,
//   Calendar,
//   Award,
//   Flag,
//   Users,
//   Briefcase,
//   Globe,
//   BarChart,
//   TrendingUp,
//   Clipboard,
//   Building,
//   Target,
//   ArrowUpRight,
//   Tag,
// } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader } from "@/components/to-delete/card"
// import { SaveButton } from "@/components/SaveButton"
// import { useToast } from "@/components/ui/use-toast"
// import { useData } from "@/context/data-context"
// import { Badge } from "@/components/ui/badge"
// import { CompanyLogo } from "@/components/vc-dashboard/core/OrgIcon"
// import { cn } from "@/lib/utils"
// import { getStatusTailwindColor } from "@/utils/startup-utils"
// import { StartupData } from "@/types/startup"

// // Import the AffinityNotes component at the top of the file
// import { AffinityNotes } from "@/components/affinity-notes"

// // First, import the AffinityPeople component at the top of the file
// import { AffinityPeople } from "@/components/affinity-people"

// // Helper function to determine the color of the raise prediction indicator
// function getRaisePredictionColor(predictor: string | undefined): string {
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
// function getRaisePredictionTooltip(predictor: string | undefined): string {
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

// // Helper function to determine the text color based on raise predictor value
// function getRaisePredictionTextColor(predictor: string | undefined): string {
//   if (!predictor || predictor.trim() === "") return "text-gray-500" // Unknown or empty

//   const predictorLower = predictor.toLowerCase().trim()

//   if (
//     predictor === "N/A" ||
//     predictor === "Not Available" ||
//     predictorLower === "n/a" ||
//     predictorLower === "not available"
//   )
//     return "text-black"
//   if (predictorLower.includes("no")) return "text-red-500"
//   if (predictorLower.includes("yes")) return "text-green-500"
//   if (predictorLower.includes("maybe")) return "text-yellow-500"

//   return "text-gray-500" // Default for unknown values
// }

// // Status color function
// function getStatusColor(status: string): string {
//   const statusColorMap: Record<string, string> = {
//     Cold: "#9b9ea7", // Gray
//     "In Queue": "#e0e3ea", // Light gray
//     "Tracking - Too Early": "#e0e3ea", // Light gray
//     Contracted: "#f37d00", // Orange
//     Engaged: "#f37d00", // Orange
//     Nurture: "#f37d00", // Orange
//     "Meeting Booked": "#f37d00", // Orange
//     "1st Meeting": "#126bf5", // Blue
//     "Follow-up meeting(s)": "#126bf5", // Blue
//     "Data Room": "#126bf5", // Blue
//     "IC 1": "#5726da", // Purple
//     "IC 2": "#5726da", // Purple
//     "IC 3": "#5726da", // Purple
//     "Term Sheet": "#5726da", // Purple
//     Portfolio: "#008a68", // Green
//     Closed: "#dc4041", // Red
//     Paused: "#f37d00", // Orange
//   }

//   return statusColorMap[status] || "#9b9ea7" // Default color if status not found
// }

// // Helper functions
// function formatNumber(num: string | number): string {
//   const parsedNum = typeof num === "string" ? Number.parseFloat(num) : num
//   return new Intl.NumberFormat("en-US").format(Math.round(parsedNum))
// }

// function formatEmployeeCount(count: string | undefined): string {
//   if (!count) return ""
//   return Math.round(Number.parseFloat(count)).toString()
// }

// // function formatScoreReasoning(reasoning: string): string {
// //   if (!reasoning) return ""

// //   // Handle the "Top 3 drivers" format (GOOD)
// //   if (reasoning.includes("Top 3 drivers")) {
// //     const parts = reasoning.split("Top 3 drivers")
// //     if (parts.length < 2) return reasoning

// //     const firstPart = parts[0].trim()
// //     const driversIntro = "Top 3 drivers"
// //     const driversList = parts[1].split(";").map((item) => item.trim())

// //     let formattedDrivers = ""
// //     driversList.forEach((driver, index) => {
// //       if (index === 0) {
// //         const driverParts = driver.split(":")
// //         if (driverParts.length > 1) {
// //           formattedDrivers += `${driverParts[0]}:\n`
// //           formattedDrivers += `1. ${driverParts[1].trim()}\n`
// //         } else {
// //           formattedDrivers += `1. ${driver}\n`
// //         }
// //       } else {
// //         formattedDrivers += `${index + 1}. ${driver}\n`
// //       }
// //     })

// //     return `${firstPart}\n${driversIntro} ${formattedDrivers}`
// //   }
// //   // Handle the BAD score format
// //   else if (reasoning.includes("BAD")) {
// //     // Extract the score intro part (e.g., "Score is 34.5 => BAD (<35).")
// //     const introMatch = reasoning.match(/(Score is [\d.]+ => BAD.*?)\./i)
// //     const intro = introMatch ? introMatch[1] : "Score is BAD"

// //     // Extract the drivers
// //     const driversMatch = reasoning.match(/Lowest 3 drivers:(.*)/s) || reasoning.match(/Lowest \d+ drivers:(.*)/s)

// //     if (!driversMatch) {
// //       // If we can't find the specific format, try to extract drivers after "BAD"
// //       const afterBad = reasoning.split("BAD")[1]
// //       if (!afterBad) return reasoning

// //       // Try to extract drivers from the remaining text
// //       const drivers = afterBad
// //         .replace(/$$.*?$$/, "") // Remove any parenthetical text
// //         .split(/[.:]/) // Split by period or colon
// //         .slice(1) // Skip the first part (which might be empty or contain other text)
// //         .join("") // Rejoin
// //         .split(/=>/) // Split by the arrow
// //         .filter(Boolean) // Remove empty strings
// //         .map((part) => {
// //           const parts = part.trim().split(/\s+/)
// //           // Try to extract the score part (e.g., "+0.00 pts")
// //           const scorePart = parts.slice(-2).join(" ")
// //           // The rest is the driver name
// //           const driverName = parts.slice(0, -2).join(" ")
// //           return `${driverName} => ${scorePart}`
// //         })

// //       if (drivers.length === 0) return reasoning

// //       // Format with proper line breaks and numbering
// //       const formattedDrivers = drivers.map((driver, index) => `${index + 1}. ${driver.trim()}`).join("\n")

// //       return `${intro}.\nBottom 3 drivers:\n${formattedDrivers}`
// //     }

// //     // Process the drivers text
// //     const driversText = driversMatch[1].trim()
// //     const drivers = driversText
// //       .split(/[\n;]/) // Split by newline or semicolon
// //       .map((driver) => driver.trim())
// //       .filter(Boolean)

// //     // Format with proper line breaks and numbering
// //     const formattedDrivers = drivers.map((driver, index) => `${index + 1}. ${driver}`).join("\n")

// //     return `${intro}.\nBottom 3 drivers:\n${formattedDrivers}`
// //   }
// //   // Handle the MIDDLE score format
// //   else if (reasoning.includes("MIDDLE")) {
// //     // Extract the score intro part (e.g., "Score is 36.9 => MIDDLE (35–40).")
// //     const introMatch = reasoning.match(/(Score is [\d.]+ => MIDDLE.*?)[.\s]/i)
// //     const intro = introMatch ? introMatch[1] : "Score is MIDDLE"

// //     // Extract the drivers
// //     // Look for patterns like "2 top + 1 bottom:" or "2 highest and 1 lowest =>"
// //     const driversMatch =
// //       reasoning.match(/(?:\d+\s+(?:top|highest).*?(?:bottom|lowest).*?:)(.*)/s) ||
// //       reasoning.match(/(?:Chosen drivers:)(.*)/s)

// //     if (!driversMatch) {
// //       // If we can't find the specific format, try to extract drivers after "MIDDLE"
// //       const afterMiddle = reasoning.split("MIDDLE")[1]
// //       if (!afterMiddle) return reasoning

// //       // Try to extract drivers from the remaining text
// //       const drivers = afterMiddle
// //         .replace(/$$.*?$$/, "") // Remove any parenthetical text
// //         .replace(/\d+\s+(?:top|highest).*?(?:bottom|lowest).*?:/, "") // Remove the intro to drivers
// //         .split(/[;\n]/) // Split by semicolon or newline
// //         .map((part) => part.trim())
// //         .filter(Boolean) // Remove empty strings

// //       if (drivers.length === 0) return reasoning

// //       // Format with proper line breaks and numbering
// //       const formattedDrivers = drivers.map((driver, index) => `${index + 1}. ${driver.trim()}`).join("\n")

// //       return `${intro}.\nMixed drivers:\n${formattedDrivers}`
// //     }

// //     // Process the drivers text
// //     const driversText = driversMatch[1].trim()
// //     const drivers = driversText
// //       .split(/[;\n]/) // Split by semicolon or newline
// //       .map((driver) => driver.trim())
// //       .filter(Boolean)

// //     // Format with proper line breaks and numbering
// //     const formattedDrivers = drivers.map((driver, index) => `${index + 1}. ${driver}`).join("\n")

// //     return `${intro}.\nMixed drivers:\n${formattedDrivers}`
// //   }

// //   // Default case: return the original text with basic formatting
// //   return reasoning.replace(/;/g, "\n")
// // }

// // Interface definitions

// interface StartupDetailsProps {
//   startup: string // This should now be domain or name as fallback
//   onBack: (vcName?: string) => void
// }

// // Component for section header
// const SectionHeader = ({ icon, title, className }: { icon: React.ReactNode; title: string; className?: string }) => (
//   <div className={cn("flex items-center space-x-2 mb-3", className)}>
//     {icon}
//     <h3 className="text-lg font-semibold text-white">{title}</h3>
//   </div>
// )

// // Component for stat item
// const StatItem = ({
//   label,
//   value,
//   icon,
//   positive = false,
//   negative = false,
// }: { label: string; value: string; icon?: React.ReactNode; positive?: boolean; negative?: boolean }) => (
//   <div className="flex items-center justify-between p-2 rounded-lg bg-[#1f3b1d]/80 hover:bg-[#184618]/90 transition-colors">
//     <div className="flex items-center gap-2">
//       {icon}
//       <span className="text-white/70">{label}</span>
//     </div>
//     <span className={cn("font-medium text-white", positive && "text-green-400", negative && "text-red-400")}>
//       {value}
//     </span>
//   </div>
// )

// // Main component
// export function StartupDetails({ startup, onBack }: StartupDetailsProps) {
//   const { startups, isLoading } = useData()
//   console.log("🔍 StartupDetails received startup:", startup)
//   const [isSaved, setIsSaved] = useState(false)
//   const [note, setNote] = useState("")
//   const [isEditing, setIsEditing] = useState(false)
//   const [isActionLoading, setIsActionLoading] = useState(false)
//   const { toast } = useToast()

//   // ✅ MOVE THIS BEFORE useEffect hooks
//   const startupData = useMemo(() => {
//     if (!startups || startups.length === 0) return null

//     // First, try to match by domain/website
//     if (startup.includes(".")) {
//       const domainMatch = startups.find((s) => {
//         const sDomain = s.domain || s.website
//         if (!sDomain) return false

//         const cleanStartupDomain = startup.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "")
//         const cleanSDomain = sDomain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "")

//         return cleanSDomain === cleanStartupDomain
//       })

//       if (domainMatch) return domainMatch
//     }

//     // Fallback to name matching
//     return startups.find((s) => s.name === startup) || null
//   }, [startups, startup])

//   useEffect(() => {
//     // Fetch saved status when component mounts
//     const fetchSavedStatus = async () => {
//       try {
//         const response = await fetch("/api/startups/saved")
//         if (response.ok) {
//           const data = await response.json()
//           // Use name for saved status since backend likely expects name
//           setIsSaved(data.savedStartups.includes(startupData?.name || startup))
//         }
//       } catch (error) {
//         console.error("Failed to fetch saved status:", error)
//       }
//     }
//     if (startupData) {
//       fetchSavedStatus()
//     }
//   }, [startup, startupData])

//   useEffect(() => {
//     const fetchNote = async () => {
//       try {
//         const noteIdentifier = startupData?.name || startup
//         const response = await fetch(`/api/notes/startup/${encodeURIComponent(noteIdentifier)}`)
//         if (response.ok) {
//           const data = await response.json()
//           setNote(data.note || "")
//         }
//       } catch (error) {
//         console.error("Failed to fetch note:", error)
//       }
//     }
//     if (startupData) {
//       fetchNote()
//     }
//   }, [startup, startupData])

//   // Show loading state while data is being fetched
//   if (isLoading && !startupData) {
//     return (
//       <div className="space-y-6 pt-24 w-full overflow-x-hidden">
//         <div className="flex items-center gap-3 mb-6">
//           <Button variant="ghost" onClick={() => onBack()} className="text-white">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back
//           </Button>
//         </div>
//         <Card className="bg-white/10 backdrop-blur-lg">
//           <CardContent className="p-6">
//             <div className="flex flex-col items-center justify-center py-20">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
//               <p className="text-white text-center">Loading startup details...</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   // Only show "not found" after data has loaded and startup is still not found
//   if (!isLoading && !startupData) {
//     return (
//       <div className="space-y-6 pt-24 w-full overflow-x-hidden">
//         <div className="flex items-center gap-3 mb-6">
//           <Button variant="ghost" onClick={() => onBack()} className="text-white">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back
//           </Button>
//         </div>
//         <Card className="bg-white/10 backdrop-blur-lg">
//           <CardContent className="p-6">
//             <p className="text-white text-center py-8">Startup data not found</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   const handleSaveNote = async () => {
//     setIsActionLoading(true)
//     try {
//       const response = await fetch(`/api/notes/startup/${encodeURIComponent(startup)}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ note }),
//       })
//       if (response.ok) {
//         setIsEditing(false)
//         toast({ title: "Note saved successfully" })
//       } else {
//         throw new Error("Failed to save note")
//       }
//     } catch (error) {
//       console.error("Error saving note:", error)
//       toast({ title: "Failed to save note", variant: "destructive" })
//     } finally {
//       setIsActionLoading(false)
//     }
//   }

//   const handleDeleteNote = async () => {
//     setIsActionLoading(true)
//     try {
//       const response = await fetch(`/api/notes/startup/${encodeURIComponent(startup)}`, {
//         method: "DELETE",
//       })
//       if (response.ok) {
//         setNote("")
//         setIsEditing(false)
//         toast({ title: "Note deleted successfully" })
//       } else {
//         throw new Error("Failed to delete note")
//       }
//     } catch (error) {
//       console.error("Error deleting note:", error)
//       toast({ title: "Failed to delete note", variant: "destructive" })
//     } finally {
//       setIsActionLoading(false)
//     }
//   }

//   // Helper function to determine growth status
//   const getGrowthStatus = (value: string | undefined) => {
//     if (!value) return {}
//     const numValue = Number.parseFloat(value)
//     if (isNaN(numValue)) return {}
//     return {
//       positive: numValue > 0,
//       negative: numValue < 0,
//     }
//   }

//   // Extract VC name from vcId if available
//   const getVCName = () => {
//     if (!startupData?.vcId) return null

//     // Extract VC name from vcId (format: vc-name-with-hyphens)
//     const vcIdParts = startupData.vcId.split("-")
//     if (vcIdParts.length < 2 || vcIdParts[0] !== "vc") return null

//     // Remove 'vc-' prefix and convert to title case
//     return vcIdParts
//       .slice(1)
//       .join("-")
//       .split("-")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ")
//   }

//   const vcName = getVCName()

//   if (!startupData) {
//     return (
//       <div>
//         <div className="flex items-center gap-3 mb-6">
//           <Button variant="ghost" onClick={() => onBack()} className="text-white">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back
//           </Button>
//         </div>
//         <Card className="bg-white/10 backdrop-blur-lg">
//           <CardContent className="p-6">
//             <p className="text-white text-center py-8">Startup data not found</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 pt-24 w-full overflow-x-hidden">
//       {/* Navigation button */}
//       <div className="flex items-center gap-3 mb-6">
//         <Button variant="ghost" onClick={() => onBack()} className="text-white">
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>
//       </div>

//       {/* Main card */}
//       <Card className="overflow-hidden bg-[#132b12]/90 backdrop-blur-lg border-white/20 shadow-xl">
//         {/* Header Section */}
//         <CardHeader className="border-b border-white/20 pb-6">
//           <div className="flex flex-wrap items-start gap-6 startup-details-header">
//             {/* Company Logo */}
//             <CompanyLogo
//               domain={startupData.website}
//               name={startupData.name}
//               size={80}
//               type="startup"
//               className="flex-shrink-0 rounded-lg shadow-lg"
//             />

//             {/* Company Info */}
//             <div className="flex-1 space-y-3">
//               {/* Company name and status */}
//               <div className="flex flex-wrap items-center gap-3">
//                 <h1 className="text-3xl font-bold text-white break-words">{startupData.name}</h1>
//                 {startupData.status && (
//                   <Badge
//                     variant="outline"
//                     className="text-white px-3 py-1 text-sm font-medium"
//                     style={{
//                       backgroundColor: getStatusColor(startupData.status),
//                       borderColor: "transparent",
//                     }}
//                   >
//                     {startupData.status}
//                   </Badge>
//                 )}
//                 <SaveButton itemId={startup} itemType="startup" initialSaved={isSaved} />

//                 {/* Raise Prediction Indicator */}
//                 <div className="relative group flex items-center">
//                   <div
//                     className={`h-4 w-4 rounded-full inline-block ${getRaisePredictionColor(startupData.raisePredictor)}`}
//                     aria-label="Raise Prediction Indicator"
//                   ></div>
//                   <div className="absolute z-50 invisible group-hover:visible bg-black text-white text-xs rounded py-1 px-2 -left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap">
//                     {getRaisePredictionTooltip(startupData.raisePredictor)}
//                   </div>
//                 </div>
//               </div>

//               {/* Location */}
//               <div className="flex items-center text-white">
//                 <Globe className="h-4 w-4 mr-2 text-white" />
//                 <span>
//                   {startupData.city}, {startupData.state}
//                 </span>
//               </div>

//               {/* Quick stats */}
//               <div className="flex flex-wrap gap-6 mt-2">
//                 {startupData.companyScore && (
//                   <div className="flex items-center">
//                     <Award className="h-5 w-5 text-yellow-300 mr-2" />
//                     <span className="text-white inline-flex items-baseline">
//                       Score:
//                       <span
//                         className={`ml-1.5 font-semibold ${getRaisePredictionTextColor(startupData.raisePredictor)}`}
//                       >
//                         {Math.round(Number.parseFloat(startupData.companyScore))}
//                       </span>
//                     </span>
//                   </div>
//                 )}
//                 {startupData.foundedDate && (
//                   <div className="flex items-center">
//                     <Calendar className="h-5 w-5 text-white mr-2" />
//                     <span className="text-white">Founded:</span>
//                     <span className="ml-1 font-semibold text-white break-words">{startupData.foundedDate}</span>
//                   </div>
//                 )}
//                 {startupData.startupTotalEmployees && (
//                   <div className="flex items-center">
//                     <Users className="h-5 w-5 text-white mr-2" />
//                     <span className="text-white">Employees:</span>
//                     <span className="ml-1 font-semibold text-white break-words">
//                       {formatEmployeeCount(startupData.startupTotalEmployees)}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* External links */}
//             <div className="flex flex-col gap-2 startup-details-buttons">
//               {startupData.linkedin && (
//                 <Button variant="outline" asChild size="sm" className="bg-white/20 text-white hover:bg-white/30 w-full">
//                   <a href={startupData.linkedin} target="_blank" rel="noopener noreferrer">
//                     <Linkedin className="mr-2 h-4 w-4" />
//                     LinkedIn
//                   </a>
//                 </Button>
//               )}
//               {startupData.website && (
//                 <Button variant="outline" asChild size="sm" className="bg-white/20 text-white hover:bg-white/30 w-full">
//                   <a
//                     href={
//                       startupData.website.startsWith("http") ? startupData.website : `https://${startupData.website}`
//                     }
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     <Globe className="mr-2 h-4 w-4" />
//                     Website
//                   </a>
//                 </Button>
//               )}
//             </div>
//           </div>
//         </CardHeader>

//         {/* Main content */}
//         <CardContent className="p-6 startup-details-content">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Left column */}
//             <div className="space-y-6 md:col-span-2">
//               {/* Summary section */}
//               <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                 <SectionHeader icon={<Clipboard className="h-5 w-5 text-white" />} title="Summary" />
//                 <p className="text-white leading-relaxed break-words">{startupData.summary}</p>
//               </section>

//               {/* Funding info */}
//               {(startupData.lastRound || startupData.lastFundingAmount || startupData.totalRaised) && (
//                 <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                   <SectionHeader icon={<DollarSign className="h-5 w-5 text-white" />} title="Funding Information" />
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     {startupData.lastRound && (
//                       <div className="bg-white/5 p-3 rounded-lg">
//                         <div className="text-sm text-white/60 mb-1">Last Round</div>
//                         <div className="text-lg font-medium text-white">
//                           {startupData.lastRound}
//                           {startupData.recentFunding && (
//                             <span className="text-sm font-normal text-white/60 ml-1">
//                               ({startupData.recentFunding})
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {startupData.lastFundingAmount && (
//                       <div className="bg-white/5 p-3 rounded-lg">
//                         <div className="text-sm text-white/60 mb-1">Last Funding</div>
//                         <div className="text-lg font-medium text-white">
//                           ${formatNumber(startupData.lastFundingAmount)}
//                         </div>
//                       </div>
//                     )}

//                     {startupData.totalRaised && (
//                       <div className="bg-white/5 p-3 rounded-lg">
//                         <div className="text-sm text-white/60 mb-1">Total Raised</div>
//                         <div className="text-lg font-medium text-white">${formatNumber(startupData.totalRaised)}</div>
//                       </div>
//                     )}
//                   </div>
//                 </section>
//               )}

//               {/* CEO LinkedIn section - renamed from Leadership */}
//               {startupData.ceoLinkedin && (
//                 <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                   <SectionHeader icon={<User className="h-5 w-5 text-white" />} title="CEO LinkedIn" />
//                   <div className="flex flex-col space-y-2">
//                     {startupData.ceoLinkedin.split(",").map((url, index) => {
//                       const profileName = url.trim().split("/").pop()?.replace(/\/$/, "")
//                       return (
//                         <a
//                           key={index}
//                           href={url.trim()}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="flex items-center gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
//                         >
//                           <div className="bg-white/20 text-white rounded-full p-2">
//                             <Linkedin className="h-5 w-5" />
//                           </div>
//                           <div className="font-medium text-white break-all">{profileName}</div>
//                           <ArrowUpRight className="h-4 w-4 ml-auto text-[#3ea04d]" />
//                         </a>
//                       )
//                     })}
//                   </div>
//                 </section>
//               )}

//               {/* Score Reasoning section */}
//               {startupData.scoreReasoning && (
//                 <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                   <SectionHeader icon={<Award className="h-5 w-5 text-yellow-300" />} title="Score Reasoning" />
//                   <div className="bg-white/5 p-4 rounded-lg whitespace-pre-wrap leading-relaxed text-white">
//                   {startupData.scoreReasoning}
//                   </div>
//                 </section>
//               )}

//               {/* Notes section */}
//               <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                 <SectionHeader icon={<Edit2 className="h-5 w-5 text-white" />} title="Notes" />
//                 <AffinityNotes domain={startupData.website || ""} />
//               </section>
//             </div>

//             {/* Right column */}
//             <div className="space-y-6">
//               {/* Key Details card */}
//               <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                 <SectionHeader icon={<Briefcase className="h-5 w-5 text-white" />} title="Key Details" />
//                 <div className="space-y-2">
//                   {startupData.flaggedBy && (
//                     <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
//                       <div className="flex items-center gap-2">
//                         <Flag className="h-4 w-4 text-white" />
//                         <span className="text-white/70">Flagged By</span>
//                       </div>
//                       <div className="flex flex-wrap gap-1 justify-end">
//                         {startupData.flaggedBy.split(";").map((person, index) => (
//                           <Badge
//                             key={`flagged-${index}`}
//                             variant="outline"
//                             className="bg-white/5 hover:bg-white/10 text-white border-0"
//                           >
//                             {person.trim()}
//                           </Badge>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {startupData.startupExcitement && (
//                     <StatItem
//                       label="Excitement"
//                       value={startupData.startupExcitement}
//                       icon={<Award className="h-4 w-4 text-white" />}
//                     />
//                   )}

//                   {startupData.connectedWithCompany && (
//                     <StatItem
//                       label="Connected w/ Company"
//                       value={startupData.connectedWithCompany}
//                       icon={<Users className="h-4 w-4 text-white" />}
//                     />
//                   )}

//                   {startupData.businessModel && (
//                     <StatItem
//                       label="Business Model"
//                       value={startupData.businessModel}
//                       icon={<Building className="h-4 w-4 text-white" />}
//                     />
//                   )}

//                   {startupData.endMarket && (
//                     <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
//                       <div className="flex items-center gap-2">
//                         <Target className="h-4 w-4 text-white" />
//                         <span className="text-white/70">End Market</span>
//                       </div>
//                       <div className="flex flex-wrap gap-1 justify-end">
//                         {startupData.endMarket.split(";").map((market, index) => (
//                           <Badge
//                             key={`market-${index}`}
//                             variant="outline"
//                             className="bg-white/5 hover:bg-white/10 text-white border-0"
//                           >
//                             {market.trim()}
//                           </Badge>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {startupData.subVertical && (
//                     <StatItem
//                       label="Sub Vertical"
//                       value={startupData.subVertical || "Not Available"}
//                       icon={<Tag className="h-4 w-4 text-white" />}
//                     />
//                   )}
//                 </div>
//               </section>

//               {/* Current Investors - Removed Innovius Coverage section */}
//               {startupData.currentInvestors && (
//                 <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                   <SectionHeader icon={<DollarSign className="h-5 w-5 text-white" />} title="Current Investors" />
//                   <div className="flex flex-wrap gap-2">
//                     {startupData.currentInvestors.split(";").map((investor, index) => {
//                       const investorName = investor.trim()
//                       const normalizedInvestorName = investorName.toLowerCase().replace(/[^\w\s]/g, "")

//                       // Parse and normalize the connections for comparison
//                       const innoviusConnections =
//                         startupData.innoviusInvestorConnections?.split(";").map((c) =>
//                           c
//                             .trim()
//                             .toLowerCase()
//                             .replace(/[^\w\s]/g, ""),
//                         ) || []

//                       // Check for match
//                       const hasInnoviusConnection = innoviusConnections.some(
//                         (connection) =>
//                           connection === normalizedInvestorName ||
//                           normalizedInvestorName.includes(connection) ||
//                           connection.includes(normalizedInvestorName),
//                       )

//                       return (
//                         <div key={`investor-${index}`} className="relative group">
//                           <Badge
//                             variant="outline"
//                             className={cn(
//                               "px-3 py-1.5 text-sm font-medium transition-colors",
//                               hasInnoviusConnection
//                                 ? "bg-white text-[#132b12] hover:bg-white/90"
//                                 : "bg-white/5 hover:bg-white/10 text-white border-0",
//                             )}
//                           >
//                             {investorName}
//                           </Badge>

//                           {/* Custom tooltip */}
//                           <div
//                             className={cn(
//                               "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm rounded-md shadow-lg opacity-0 invisible transition-opacity duration-200 w-max max-w-xs text-center z-[9999]",
//                               "group-hover:opacity-100 group-hover:visible",
//                               "bg-[#111827] border border-gray-800",
//                             )}
//                           >
//                             <div className="relative">
//                               <p className="text-[#FFCC99] text-sm font-medium">
//                                 {hasInnoviusConnection
//                                   ? "This investor has connections with Innovius."
//                                   : "No Innovius connections."}
//                               </p>
//                               {/* Tooltip arrow */}
//                               <div
//                                 className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#111827]"
//                                 style={{ width: 0, height: 0 }}
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       )
//                     })}
//                   </div>
//                 </section>
//               )}

//               {/* People from Affinity */}
//               <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                 <SectionHeader icon={<Users className="h-5 w-5 text-white" />} title="People" />
//                 <AffinityPeople domain={startupData.website || ""} />
//               </section>

//               {/* Growth Metrics */}
//               <section className="bg-[#184618]/70 rounded-lg p-4 border border-white/10">
//                 <SectionHeader icon={<BarChart className="h-5 w-5 text-white" />} title="Growth Metrics" />
//                 <div className="space-y-2">
//                   {startupData.headcount180dPct !== undefined && startupData.headcount180dPct !== null && (
//                     <StatItem
//                       label="180d Headcount %"
//                       value={`${startupData.headcount180dPct}%`}
//                       icon={<Users className="h-4 w-4 text-white" />}
//                       {...getGrowthStatus(String(startupData.headcount180dPct))}
//                     />
//                   )}

//                   {startupData.headcount1yPct !== undefined && startupData.headcount1yPct !== null && (
//                     <StatItem
//                       label="1 Year Headcount %"
//                       value={`${startupData.headcount1yPct}%`}
//                       icon={<Users className="h-4 w-4 text-white" />}
//                       {...getGrowthStatus(String(startupData.headcount1yPct))}
//                     />
//                   )}

//                   {startupData.sales1yPct !== undefined && startupData.sales1yPct !== null && (
//                     <StatItem
//                       label="1 Year Sales %"
//                       value={`${startupData.sales1yPct}%`}
//                       icon={<TrendingUp className="h-4 w-4 text-white" />}
//                       {...getGrowthStatus(String(startupData.sales1yPct))}
//                     />
//                   )}

//                   {startupData.webTraffic1yPct !== undefined && startupData.webTraffic1yPct !== null && (
//                     <StatItem
//                       label="1 Year Web Traffic %"
//                       value={`${startupData.webTraffic1yPct}%`}
//                       icon={<Globe className="h-4 w-4 text-white" />}
//                       {...getGrowthStatus(String(startupData.webTraffic1yPct))}
//                     />
//                   )}

//                   {startupData.webTraffic180dPct !== undefined && startupData.webTraffic180dPct !== null && (
//                     <StatItem
//                       label="180d Web Traffic %"
//                       value={`${startupData.webTraffic180dPct}%`}
//                       icon={<Globe className="h-4 w-4 text-white" />}
//                       {...getGrowthStatus(String(startupData.webTraffic180dPct))}
//                     />
//                   )}

//                   {startupData.sales180dPct !== undefined && startupData.sales180dPct !== null && (
//                     <StatItem
//                       label="180d Sales Growth %"
//                       value={`${startupData.sales180dPct}%`}
//                       icon={<TrendingUp className="h-4 w-4 text-white" />}
//                       {...getGrowthStatus(String(startupData.sales180dPct))}
//                     />
//                   )}
//                 </div>
//               </section>
//               {/* Innovius Coverage */}
//               {startupData.innoviusCoverage && (
//                 <section className="bg-[#1f3b1d]/70 rounded-lg p-4 border border-white/10">
//                   <SectionHeader icon={<Clipboard className="h-5 w-5 text-white" />} title="Innovius Coverage" />
//                   <div className="flex flex-wrap gap-2">
//                     {startupData.innoviusCoverage.split(";").map((person, index) => (
//                       <Badge
//                         key={`coverage-${index}`}
//                         variant="outline"
//                         className="bg-white/5 hover:bg-white/10 text-white border-0 px-3 py-1"
//                       >
//                         {person.trim()}
//                       </Badge>
//                     ))}
//                   </div>
//                 </section>
//               )}
//               {/* Additional Details */}
//               {(startupData.conferences || startupData.expectedRaise) && (
//                 <section className="bg-[#1f3b1d]/70 rounded-lg p-4 border border-white/10">
//                   <SectionHeader icon={<Clipboard className="h-5 w-5 text-white" />} title="Additional Details" />
//                   <div className="space-y-2">
//                     {startupData.conferences && (
//                       <StatItem
//                         label="Conferences"
//                         value={startupData.conferences || "Not Available"}
//                         icon={<Calendar className="h-4 w-4 text-white" />}
//                       />
//                     )}

//                     {startupData.expectedRaise && (
//                       <StatItem
//                         label="Expected Raise"
//                         value={startupData.expectedRaise || "Not Available"}
//                         icon={<DollarSign className="h-4 w-4 text-white" />}
//                       />
//                     )}
//                   </div>
//                 </section>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
