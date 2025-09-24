'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Load Analytics only on the client to avoid SSR useContext/usePathname issues
const Analytics = dynamic(() => import('@vercel/analytics/react').then(m => m.Analytics), {
  ssr: false,
  loading: () => null,
})

export default function AnalyticsClient() {
  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  )
}


