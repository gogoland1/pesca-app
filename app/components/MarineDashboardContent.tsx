'use client'

import { useMarineData, useMarineNavigation } from '../contexts/MarineDataContext'
import AppNavigation from './AppNavigation'
import MarineNavigationTabs from './MarineNavigationTabs'
import WeatherConditionsView from './WeatherConditionsView'
import ModelosPescaView from './ModelosPescaView'
import PrediccionesView from './PrediccionesView'
import { RefreshCw, MapPin, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MarineDashboardContent() {
  const { marineData, currentPort, loading, error, refreshData } = useMarineData()
  const { currentView, getViewTitle, getViewDescription } = useMarineNavigation()
  const router = useRouter()

  if (loading && !marineData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-ocean-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ocean-800 mb-2">
            Cargando Dashboard Meteorológico
          </h2>
          <p className="text-ocean-600">
            Obteniendo datos en tiempo real para {currentPort.name}...
          </p>
        </div>
      </div>
    )
  }

  if (error && !marineData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error al Cargar Datos</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-sm text-red-600">
            Verifica tu conexión a internet e intenta nuevamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header con información actual y Nueva Búsqueda */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-ocean-800 mb-4">
            {getViewTitle()}
          </h2>
          <div className="flex items-center justify-center space-x-2 text-ocean-600 mb-4">
            <MapPin className="h-4 w-4" />
            <span>{currentPort.name} • {currentPort.coordinates.lat.toFixed(4)}°, {currentPort.coordinates.lon.toFixed(4)}°</span>
            <button 
              onClick={refreshData}
              className="ml-2 p-1 hover:bg-ocean-100 rounded-full transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm text-gray-500 mb-4">
            {currentPort.region}
          </div>
          
          {/* Botón Nueva Búsqueda */}
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center space-x-2 bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Nueva Búsqueda</span>
          </button>
        </div>

        {/* Navegación entre vistas */}
        <MarineNavigationTabs />

        {/* Contenido de la vista actual */}
        <div className="space-y-6">
          {currentView === 'conditions' && <WeatherConditionsView />}
          {currentView === 'models' && <ModelosPescaView />}
          {currentView === 'predictions' && <PrediccionesView />}
        </div>

        {/* Footer informativo */}
        <div className="mt-12 text-center text-sm text-gray-500 space-y-2">
          <p>
            <strong>🇨🇱 Desarrollado para pescadores artesanales chilenos</strong>
          </p>
          <p>
            Datos en tiempo real desde APIs meteorológicas y oceanográficas oficiales
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
            <span>🌤️ Meteorología: OpenWeather + Open-Meteo</span>
            <span>🌊 Oceanografía: Copernicus Marine</span>
            <span>🛰️ Satélites: MODIS/VIIRS</span>
          </div>
        </div>
      </div>
    </div>
  )
}