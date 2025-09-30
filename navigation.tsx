"use client"

import { useRouter as useNextRouter, useSearchParams as useNextSearchParams } from "next/navigation"

export const useRouter = () => {
  return useNextRouter()
}

export const useSearchParams = () => {
  return useNextSearchParams()
}
