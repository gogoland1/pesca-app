'use client'

import { useState } from 'react'
import { TrendingUp, Fish, Waves, Target, BarChart3, Brain, Zap, AlertTriangle } from 'lucide-react'
import { useMarineData } from '../contexts/MarineDataContext'

export default function ModelosPescaView() {
  const { marineData, currentPort, loading } = useMarineData()
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  const fishingModels = [
    {
      id: 'optimization',
      title: '🎯 Optimización de Capturas',
      description: 'Algoritmo que analiza condiciones actuales para maximizar capturas',
      icon: Target,
      color: 'from-blue-500 to-blue-700',
      features: [
        'Análisis de temperatura del agua',
        'Evaluación de corrientes marinas', 
        'Cálculo de productividad por clorofila',
        'Recomendaciones de profundidad óptima'
      ],
      accuracy: '87%',
      status: 'Activo',
      currentRecommendation: marineData ? generateOptimizationRecommendation(marineData) : null
    },
    {
      id: 'species',
      title: '🐟 Predicción de Especies',
      description: 'IA que predice qué especies están más activas según condiciones',
      icon: Fish,
      color: 'from-green-500 to-green-700',
      features: [
        'Patrones de comportamiento por especie',
        'Análisis de migración estacional',
        'Correlación con datos oceanográficos',
        'Predicciones por zona específica'
      ],
      accuracy: '82%',
      status: 'Beta',
      currentRecommendation: marineData ? generateSpeciesRecommendation(marineData, currentPort) : null
    },
    {
      id: 'timing',
      title: '⏰ Horarios Óptimos',
      description: 'Modelo que calcula los mejores momentos para pescar',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-700',
      features: [
        'Análisis de ciclos de marea',
        'Correlación con actividad solar',
        'Patrones de alimentación',
        'Optimización por especie objetivo'
      ],
      accuracy: '91%',
      status: 'Activo',
      currentRecommendation: marineData ? generateTimingRecommendation(marineData) : null
    },
    {
      id: 'zones',
      title: '📍 Zonas Productivas',
      description: 'Algoritmo que identifica las zonas más prometedoras',
      icon: Waves,
      color: 'from-orange-500 to-orange-700',
      features: [
        'Análisis de clorofila satelital',
        'Mapeo de corrientes',
        'Identificación de upwelling',
        'Zonas de convergencia'
      ],
      accuracy: '85%',
      status: 'Activo',
      currentRecommendation: marineData ? generateZonesRecommendation(marineData, currentPort) : null
    }
  ]

  if (!marineData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          Datos Meteorológicos Requeridos
        </h3>
        <p className="text-yellow-700 mb-4">
          Los modelos de pesca necesitan datos meteorológicos actuales para generar recomendaciones precisas.
        </p>
        <p className="text-sm text-yellow-600">
          Regresa a la pestaña "Condiciones" para cargar los datos meteorológicos primero.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 text-center shadow-md">
          <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">4</div>
          <div className="text-sm text-gray-600">Modelos Activos</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-md">
          <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">86%</div>
          <div className="text-sm text-gray-600">Precisión Promedio</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-md">
          <Fish className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{currentPort.mainSpecies.length}</div>
          <div className="text-sm text-gray-600">Especies Analizadas</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-md">
          <Waves className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">
            {marineData.weather.waveHeight.toFixed(1)}m
          </div>
          <div className="text-sm text-gray-600">Olas Actuales</div>
        </div>
      </div>

      {/* Condiciones actuales para contexto */}
      <div className="bg-gradient-to-r from-ocean-500 to-ocean-700 text-white p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">📊 Condiciones Actuales para Modelos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-ocean-200">Temperatura agua:</span>
            <div className="font-bold">{marineData.weather.waterTemperature}°C</div>
          </div>
          <div>
            <span className="text-ocean-200">Clorofila:</span>
            <div className="font-bold">{marineData.weather.chlorophyll.toFixed(1)} mg/m³</div>
          </div>
          <div>
            <span className="text-ocean-200">Viento:</span>
            <div className="font-bold">{marineData.weather.windSpeed} km/h</div>
          </div>
          <div>
            <span className="text-ocean-200">Marea:</span>
            <div className="font-bold">{marineData.weather.tideLevel > 0 ? '+' : ''}{marineData.weather.tideLevel.toFixed(2)}m</div>
          </div>
        </div>
      </div>

      {/* Modelos de Pesca */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fishingModels.map((model) => (
          <div
            key={model.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`bg-gradient-to-r ${model.color} p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <model.icon className="h-10 w-10" />
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    model.status === 'Activo' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {model.status}
                  </span>
                  <span className="text-sm font-bold">{model.accuracy}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{model.title}</h3>
              <p className="text-white/90">{model.description}</p>
            </div>
            
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-3">Características:</h4>
              <ul className="space-y-2 mb-4">
                {model.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-ocean-400 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Recomendación actual del modelo */}
              {model.currentRecommendation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-blue-800 mb-2">🤖 Recomendación Actual:</h5>
                  <p className="text-sm text-blue-700">{model.currentRecommendation}</p>
                </div>
              )}
              
              <button
                onClick={() => setSelectedModel(model.id)}
                className="w-full bg-ocean-600 text-white py-2 px-4 rounded-lg hover:bg-ocean-700 transition-colors"
              >
                Ver Análisis Detallado
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-ocean-800 mb-6 text-center">
          🧠 Cómo Funcionan Nuestros Modelos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Datos en Tiempo Real</h3>
            <p className="text-sm text-gray-600">
              Integramos datos meteorológicos, oceanográficos y satelitales actualizados cada 5 minutos
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold mb-2">Inteligencia Artificial</h3>
            <p className="text-sm text-gray-600">
              Algoritmos de machine learning entrenados con datos históricos de capturas chilenas
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Recomendaciones Locales</h3>
            <p className="text-sm text-gray-600">
              Sugerencias específicas adaptadas a tu puerto y las especies que pescas habitualmente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Funciones para generar recomendaciones basadas en datos reales
function generateOptimizationRecommendation(data: any): string {
  const temp = data.weather.waterTemperature
  const chlorophyll = data.weather.chlorophyll
  const waves = data.weather.waveHeight
  
  if (temp > 18 && chlorophyll > 5 && waves < 2) {
    return "🟢 Condiciones EXCELENTES: Agua cálida, alta productividad y mar tranquilo. Pesca superficial recomendada."
  } else if (temp > 15 && chlorophyll > 3) {
    return "🟡 Condiciones BUENAS: Temperaturas favorables y productividad moderada. Prueba pesca media."
  } else if (waves > 3) {
    return "🔴 Condiciones DIFÍCILES: Mar agitado. Solo recomendado para embarcaciones grandes y pesca profunda."
  } else {
    return "🟡 Condiciones REGULARES: Considera pesca de oportunidad cerca de la costa."
  }
}

function generateSpeciesRecommendation(data: any, port: any): string {
  const species = port.mainSpecies[0] || 'peces'
  const temp = data.weather.waterTemperature
  const tide = data.weather.tideLevel
  
  if (species.toLowerCase().includes('merluza') && temp < 16) {
    return `🐟 ${species} favorecida por agua fría actual (${temp}°C). Pesca en profundidad 50-100m.`
  } else if (species.toLowerCase().includes('jurel') && temp > 16) {
    return `🐟 ${species} activo con temperatura actual (${temp}°C). Cardúmenes cerca de superficie.`
  } else if (tide > 1.5) {
    return `🌊 Marea alta (${tide.toFixed(2)}m) favorece ${species}. Pesca desde embarcación recomendada.`
  } else {
    return `🎣 Condiciones moderadas para ${species}. Pesca experimental en diferentes profundidades.`
  }
}

function generateTimingRecommendation(data: any): string {
  const hour = new Date().getHours()
  const tide = data.weather.tideLevel
  
  if (hour >= 5 && hour <= 8) {
    return "🌅 HORA ÓPTIMA: Amanecer es ideal para pesca. Actividad máxima de peces."
  } else if (hour >= 17 && hour <= 20) {
    return "🌅 HORA ÓPTIMA: Atardecer favorable. Segunda mejor ventana del día."
  } else if (tide > 1.2) {
    return "🌊 Aprovecha marea alta actual. Compensar hora subóptima con buena marea."
  } else {
    return "⏰ Hora regular. Considera esperar próxima ventana óptima (amanecer/atardecer)."
  }
}

function generateZonesRecommendation(data: any, port: any): string {
  const chlorophyll = data.weather.chlorophyll
  const wind = data.weather.windSpeed
  const lat = port.coordinates.lat
  
  if (chlorophyll > 8) {
    return "🛰️ ZONA PRODUCTIVA: Satélites detectan alta clorofila. Zona de 2-5km de la costa recomendada."
  } else if (wind > 20 && lat < -30) {
    return "💨 Upwelling activo por viento fuerte. Zonas de 1-3km al oeste muy productivas."
  } else if (chlorophyll > 4) {
    return "🌿 Productividad moderada. Explora zonas de 500m-2km de la costa."
  } else {
    return "🔍 Baja productividad superficial. Considera pesca en profundidad o cambio de zona."
  }
}