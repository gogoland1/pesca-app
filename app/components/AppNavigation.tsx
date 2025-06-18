'use client'

import { useMarineData, useMarineNavigation } from '../contexts/MarineDataContext'
import { MapPin, RefreshCw, Home, TrendingUp, Calendar, RotateCcw, Satellite, ExternalLink } from 'lucide-react'

interface AppNavigationProps {
  onNewSearch?: () => void
}

export default function AppNavigation({ onNewSearch }: AppNavigationProps) {
  const { 
    marineData, 
    currentPort, 
    loading, 
    refreshData 
  } = useMarineData()
  
  const {
    currentView,
    navigateToConditions,
    navigateToModels,
    navigateToPredictions,
    navigateToVisualizations,
    hasData
  } = useMarineNavigation()

  const handleNewSearch = () => {
    if (onNewSearch) {
      onNewSearch()
    } else {
      // Clear data and navigate to home page for port selection  
      window.location.href = '/'
    }
  }

  const navigationItems = [
    {
      key: 'conditions',
      label: 'Condiciones',
      icon: Home,
      active: currentView === 'conditions',
      onClick: navigateToConditions,
      href: '/dashboard'
    },
    {
      key: 'visualizations',
      label: 'Satélite',
      icon: Satellite,
      active: currentView === 'visualizations',
      onClick: navigateToVisualizations,
      href: '/visualizaciones'
    },
    {
      key: 'models',
      label: 'Modelos',
      icon: TrendingUp,
      active: currentView === 'models',
      onClick: navigateToModels,
      href: '/modelos-pesca'
    },
    {
      key: 'predictions',
      label: 'Predicciones',
      icon: Calendar,
      active: currentView === 'predictions',
      onClick: navigateToPredictions,
      href: '/predicciones'
    }
  ]

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Header principal */}
        <div className="flex items-center justify-between py-4">
          {/* Información del puerto actual */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-ocean-600" />
              <div>
                <h1 className="text-lg font-semibold text-ocean-800">
                  {currentPort.name}
                </h1>
                <div className="text-sm text-gray-500">
                  {currentPort.coordinates.lat.toFixed(4)}°, {currentPort.coordinates.lon.toFixed(4)}°
                </div>
              </div>
            </div>
          </div>

          {/* Controles de acción */}
          <div className="flex items-center space-x-3">
            {/* Estado de datos */}
            {hasData && marineData && (
              <div className="text-sm text-gray-500">
                <span className="hidden sm:inline">Actualizado: </span>
                {new Date(marineData.weather.timestamp).toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}

            {/* Botón Actualizar */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-ocean-100 text-ocean-700 hover:bg-ocean-200 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Enlace a Olitai Project */}
            <a
              href="https://gogoland1.github.io/olitai.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors"
              title="Visita mi otro proyecto"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Olitai</span>
            </a>

            {/* Botón Nueva Búsqueda */}
            <button
              onClick={handleNewSearch}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Nueva Búsqueda</span>
            </button>
          </div>
        </div>

        {/* Navegación entre vistas */}
        <div className="flex items-center space-x-1 pb-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => {
                  item.onClick()
                  if (item.href && window.location.pathname !== item.href) {
                    window.location.href = item.href
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-ocean-600 text-white'
                    : 'text-ocean-600 hover:bg-ocean-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Indicador de carga */}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-ocean-100">
            <div className="h-full bg-ocean-600 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  )
}