// This is the page for a specific VC
"use client"
import { VentureData } from "@/lib/data-utils"
import { useEffect, useState } from "react"

export default function VCDetailPage({ params }: { params: { id: string } }) {
  const [vc, setVc] = useState<VentureData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const vcId = params.id

  useEffect(() => {
    const fetchVC = async () => {
      try {
        console.log(vcId)
        const response = await fetch(`/api/vc/${vcId}`) 
        if (!response.ok) {
            throw new Error(`Failed to fetch VC: ${response.status}`)
        }
        const data = await response.json()
        setVc(data.data)
        setLoading(false)
    } catch (error) {
        setLoading(false)
        setError(error instanceof Error ? error.message : 'Failed to load VC')
    } finally {
        setLoading(false)
    }
  }
  fetchVC()
}, [vcId])

  return (
    <div>
      <h1>VC Detail Page</h1>
      <p>Name: {vc?.name}</p>
      <p>City: {vc?.city}</p>
      <p>State: {vc?.state}</p>
      <p>Website: {vc?.website}</p>
      <p>Description: {vc?.description}</p>
      <p>Logo: {vc?.logo}</p>
      <p>VC Score: {vc?.vcScore}</p>
      <p>AUM: {vc?.aum}</p>
      <p>Stage Distribution: {vc?.stageDistribution}</p>
      <p>In Affinity: {vc?.inAffinity}</p>
      <p>Number of Portfolio Companies: {vc?.numberOfPortfolioCompanies}</p>
    </div>
  )
}
