'use client'

import { MarineDataProvider } from '../contexts/MarineDataContext'
import MarineDashboardContent from '../components/MarineDashboardContent'

export default function DashboardPage() {
  return (
    <MarineDataProvider>
      <MarineDashboardContent />
    </MarineDataProvider>
  )
}