'use client'

import { useEffect } from 'react'
import { useMarineNavigation } from '../contexts/MarineDataContext'
import ClientLayout from '../components/ClientLayout'
import SatelliteVisualizationDashboard from '../components/SatelliteVisualizationDashboard'

export default function VisualizacionesPage() {
  const { navigateToVisualizations } = useMarineNavigation()

  useEffect(() => {
    navigateToVisualizations()
  }, [navigateToVisualizations])

  return (
    <ClientLayout>
      <SatelliteVisualizationDashboard />
    </ClientLayout>
  )
}