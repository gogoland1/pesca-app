'use client'

import { useMarineData, useMarineNavigation } from '../contexts/MarineDataContext'
import MarineNavigationTabs from './MarineNavigationTabs'
import WeatherConditionsView from './WeatherConditionsView'
import ModelosPescaView from './ModelosPescaView'
import PrediccionesView from './PrediccionesView'
import { RefreshCw, MapPin } from 'lucide-react'

export default function MarineDashboardContent() {
  const { marineData, currentPort, loading, error } = useMarineData()
  const { currentView, getViewTitle, getViewDescription } = useMarineNavigation()

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
      <div className="container mx-auto px-4 py-6">
        {/* Header Principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ocean-800 mb-4">
            🌊 Dashboard Meteorológico Pesquero
          </h1>
          <div className="flex items-center justify-center space-x-2 text-ocean-600 mb-2">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">
              {currentPort.name} • {currentPort.region}
            </span>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Plataforma integral con datos meteorológicos, modelos de IA y predicciones 
            para optimizar tus actividades de pesca artesanal
          </p>
        </div>

        {/* Navegación entre vistas */}
        <MarineNavigationTabs />

        {/* Header de vista actual */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-ocean-800 mb-2">
            {getViewTitle()}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {getViewDescription()}
          </p>
        </div>

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