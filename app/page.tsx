'use client'

import { useState } from 'react'
import WeatherDashboard from './components/WeatherDashboard'
import LandingPage from './components/LandingPage'
import { useMarineData } from './contexts/MarineDataContext'
import type { FishingPort } from './data/fishing-ports'

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false)
  const { setCurrentPort, setCurrentView } = useMarineData()

  const handlePortSelected = (port: FishingPort) => {
    setCurrentPort(port)
    setCurrentView('conditions')
    setShowDashboard(true)
  }

  if (!showDashboard) {
    return <LandingPage onPortSelected={handlePortSelected} />
  }

  return <WeatherDashboard />
}