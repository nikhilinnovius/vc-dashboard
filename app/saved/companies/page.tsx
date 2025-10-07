// Heading with "Saved Companies" followed by a GridView of the saved companies, LoadingIndicator, and Error message if there is an error

import { GridView } from "@/components/vc-dashboard/core/GridView"
import { LoadingIndicator } from "@/components/vc-dashboard/shared/LoadingStates"

export default function SavedCompaniesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Saved Companies</h1>
      <GridView type="startup" data={[]} filter={{ type: null, value: null }} />
    </div>
  )
}