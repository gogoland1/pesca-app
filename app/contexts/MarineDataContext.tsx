'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MarineDataService } from '../lib/marine-data'
import { getPortById, type FishingPort } from '../data/fishing-ports'
import type { MarineConditions } from '../types/weather'

interface MarineDataContextType {
  // Estado de datos
  marineData: MarineConditions | null
  currentPort: FishingPort
  loading: boolean
  error: string | null
  
  // Cache de datos
  dataCache: Map<string, MarineConditions>
  
  // Acciones
  setCurrentPort: (port: FishingPort) => void
  refreshData: () => Promise<void>
  clearError: () => void
  
  // Navegación entre vistas
  currentView: 'conditions' | 'models' | 'predictions' | 'visualizations'
  setCurrentView: (view: 'conditions' | 'models' | 'predictions' | 'visualizations') => void
}

const MarineDataContext = createContext<MarineDataContextType | undefined>(undefined)

interface MarineDataProviderProps {
  children: ReactNode
  initialPort?: FishingPort
}

export function MarineDataProvider({ children, initialPort }: MarineDataProviderProps) {
  const [marineData, setMarineData] = useState<MarineConditions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataCache, setDataCache] = useState<Map<string, MarineConditions>>(new Map())
  const [currentView, setCurrentView] = useState<'conditions' | 'models' | 'predictions' | 'visualizations'>('conditions')
  
  const [currentPort, setCurrentPortState] = useState<FishingPort>(() => {
    // Always use default on initial render to avoid hydration mismatch
    return initialPort || getPortById('concepcion') || {
      id: 'concepcion',
      name: 'Concepción (Talcahuano)',
      region: 'Biobío',
      coordinates: { lat: -36.8, lon: -73.08 },
      description: 'Principal puerto pesquero del sur, gran flota industrial',
      mainSpecies: ['Merluza', 'Sardina', 'Anchoveta', 'Jurel'],
      portType: 'puerto',
      approximatePopulation: 3500
    }
  })

  const [isHydrated, setIsHydrated] = useState(false)

  const marineService = new MarineDataService()

  // Efecto de hidratación - cargar datos guardados después del primer render
  useEffect(() => {
    setIsHydrated(true)
    
    // Cargar puerto guardado desde localStorage solo después de hidratación
    if (typeof window !== 'undefined') {
      const savedPort = localStorage.getItem('selectedFishingPort')
      if (savedPort) {
        try {
          const parsedPort = JSON.parse(savedPort)
          setCurrentPortState(parsedPort)
        } catch (e) {
          console.log('Error parsing saved port, keeping default')
        }
      }
    }
  }, [])

  // Cargar datos cuando cambia el puerto
  useEffect(() => {
    if (isHydrated) {
      loadMarineData()
    }
  }, [currentPort, isHydrated])

  // Guardar puerto seleccionado en localStorage (solo después de hidratación)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('selectedFishingPort', JSON.stringify(currentPort))
    }
  }, [currentPort, isHydrated])

  const setCurrentPort = (port: FishingPort) => {
    setCurrentPortState(port)
  }

  const clearError = () => {
    setError(null)
  }

  const loadMarineData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const cacheKey = `${currentPort.id}_${currentPort.coordinates.lat}_${currentPort.coordinates.lon}`
      
      // Verificar cache primero (5 minutos de expiración)
      const cached = dataCache.get(cacheKey)
      if (cached && (Date.now() - new Date(cached.weather.timestamp).getTime()) < 5 * 60 * 1000) {
        console.log('✅ Using cached marine data for', currentPort.name)
        setMarineData(cached)
        setLoading(false)
        return
      }
      
      console.log('🌊 Fetching fresh marine data for', currentPort.name)
      const data = await marineService.getCompleteMarineData(
        currentPort.coordinates.lat, 
        currentPort.coordinates.lon
      )
      
      if (data) {
        setMarineData(data)
        // Actualizar cache
        setDataCache(prev => new Map(prev.set(cacheKey, data)))
        console.log('✅ Marine data loaded and cached successfully')
      } else {
        setError('No se pudieron obtener los datos meteorológicos')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('❌ Error loading marine data:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    // Limpiar cache para forzar recarga
    const cacheKey = `${currentPort.id}_${currentPort.coordinates.lat}_${currentPort.coordinates.lon}`
    setDataCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(cacheKey)
      return newCache
    })
    
    await loadMarineData()
  }

  const contextValue: MarineDataContextType = {
    // Estado
    marineData,
    currentPort,
    loading,
    error,
    dataCache,
    
    // Acciones
    setCurrentPort,
    refreshData,
    clearError,
    
    // Navegación
    currentView,
    setCurrentView
  }

  return (
    <MarineDataContext.Provider value={contextValue}>
      {children}
    </MarineDataContext.Provider>
  )
}

export function useMarineData() {
  const context = useContext(MarineDataContext)
  if (context === undefined) {
    throw new Error('useMarineData must be used within a MarineDataProvider')
  }
  return context
}

// Hook personalizado para gestión de estado de navegación
export function useMarineNavigation() {
  const { currentView, setCurrentView, currentPort, marineData } = useMarineData()
  
  const navigateToConditions = () => setCurrentView('conditions')
  const navigateToModels = () => setCurrentView('models')
  const navigateToPredictions = () => setCurrentView('predictions')
  const navigateToVisualizations = () => setCurrentView('visualizations')
  
  const getViewTitle = () => {
    switch (currentView) {
      case 'conditions': return 'Condiciones Actuales del Mar'
      case 'models': return 'Modelos de Pesca Inteligente'
      case 'predictions': return 'Predicciones Meteorológicas'
      case 'visualizations': return 'Visualizaciones Satelitales'
      default: return 'Dashboard Pesquero'
    }
  }
  
  const getViewDescription = () => {
    switch (currentView) {
      case 'conditions': return 'Datos meteorológicos y oceanográficos en tiempo real'
      case 'models': return 'Algoritmos avanzados para optimizar tus estrategias de pesca'
      case 'predictions': return 'Pronósticos extendidos para planificar tus actividades'
      case 'visualizations': return 'Mapas satelitales y datos de clorofila en tiempo real'
      default: return 'Herramientas profesionales para pescadores artesanales'
    }
  }
  
  return {
    currentView,
    navigateToConditions,
    navigateToModels,
    navigateToPredictions,
    navigateToVisualizations,
    getViewTitle,
    getViewDescription,
    hasData: !!marineData,
    portName: currentPort.name
  }
}