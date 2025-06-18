'use client'

import { TrendingUp, Calendar, Waves, RefreshCw } from 'lucide-react'
import { useMarineData, useMarineNavigation } from '../contexts/MarineDataContext'

export default function MarineNavigationTabs() {
  const { loading, error, refreshData } = useMarineData()
  const { 
    currentView, 
    navigateToConditions, 
    navigateToModels, 
    navigateToPredictions,
    hasData 
  } = useMarineNavigation()

  const tabs = [
    {
      id: 'conditions' as const,
      name: 'Condiciones',
      icon: Waves,
      description: 'Tiempo actual',
      onClick: navigateToConditions
    },
    {
      id: 'models' as const,
      name: 'Modelos IA',
      icon: TrendingUp,
      description: 'Optimización',
      onClick: navigateToModels
    },
    {
      id: 'predictions' as const,
      name: 'Predicciones',
      icon: Calendar,
      description: 'Pronósticos',
      onClick: navigateToPredictions
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ocean-800">
          🌊 Dashboard Meteorológico Completo
        </h2>
        
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-ocean-50 hover:bg-ocean-100 text-ocean-700 rounded-lg transition-colors disabled:opacity-50"
          title="Actualizar datos"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentView === tab.id
          const isDisabled = !hasData && tab.id !== 'conditions'
          
          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              disabled={isDisabled || loading}
              className={`
                relative p-4 rounded-lg transition-all duration-200 text-center
                ${isActive 
                  ? 'bg-ocean-600 text-white shadow-md transform scale-105' 
                  : isDisabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 hover:bg-ocean-50 text-gray-700 hover:text-ocean-700'
                }
              `}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 ${
                isActive ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-ocean-600'
              }`} />
              
              <div className={`font-medium text-sm ${
                isActive ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {tab.name}
              </div>
              
              <div className={`text-xs mt-1 ${
                isActive ? 'text-ocean-100' : isDisabled ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {tab.description}
              </div>

              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              )}
              
              {isDisabled && (tab.id === 'models' || tab.id === 'predictions') && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-lg">
                  <span className="text-xs text-gray-500">Carga datos primero</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Datos en tiempo real</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Cache inteligente</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Sin recarga de APIs</span>
          </div>
        </div>
      </div>
    </div>
  )
}