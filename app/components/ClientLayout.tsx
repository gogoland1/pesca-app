'use client'

import { useState, useEffect } from 'react'
import { MarineDataProvider } from '../contexts/MarineDataContext'
import APIStatsMonitor from './APIStatsMonitor'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    // Durante SSR y primera hidratación, renderizar solo el contenido básico
    return (
      <MarineDataProvider>
        {children}
      </MarineDataProvider>
    )
  }

  // Después de la hidratación, renderizar todo incluyendo componentes que usan localStorage
  return (
    <MarineDataProvider>
      {children}
      <APIStatsMonitor />
    </MarineDataProvider>
  )
}