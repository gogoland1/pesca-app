'use client'

import { useState } from 'react'
import { ArrowLeft, TrendingUp, Fish, Waves, Target, BarChart3, Brain, Zap } from 'lucide-react'
import { useMarineData } from '../contexts/MarineDataContext'
import AppNavigation from '../components/AppNavigation'

export default function ModelosPescaPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const { marineData, currentPort, loading } = useMarineData()

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
      status: 'Activo'
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
      status: 'Beta'
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
      status: 'Activo'
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
      status: 'Activo'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100">
      <AppNavigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header with data status */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-ocean-800 mb-4">
              🎯 Modelos de Pesca Inteligente
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Algoritmos avanzados que analizan condiciones oceanográficas en tiempo real 
              para optimizar tus estrategias de pesca artesanal
            </p>
            
            {/* Status de datos */}
            {marineData ? (
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Datos actualizados para {currentPort.name}</span>
              </div>
            ) : loading ? (
              <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Cargando datos...</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Sin datos disponibles</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            <div className="text-2xl font-bold text-gray-800">12</div>
            <div className="text-sm text-gray-600">Especies Analizadas</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <Waves className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">40+</div>
            <div className="text-sm text-gray-600">Puertos Cubiertos</div>
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
                <ul className="space-y-2">
                  {model.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-ocean-400 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => setSelectedModel(model.id)}
                  className="w-full mt-4 bg-ocean-600 text-white py-2 px-4 rounded-lg hover:bg-ocean-700 transition-colors"
                >
                  Ejecutar Modelo
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-ocean-800 mb-6 text-center">
            🧠 Cómo Funcionan Nuestros Modelos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Recolección de Datos</h3>
              <p className="text-sm text-gray-600">
                Integramos datos de APIs meteorológicas, satelitales y oceanográficas en tiempo real
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">Procesamiento IA</h3>
              <p className="text-sm text-gray-600">
                Algoritmos de machine learning analizan patrones y correlaciones complejas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Recomendaciones</h3>
              <p className="text-sm text-gray-600">
                Generamos sugerencias específicas adaptadas a tu ubicación y objetivos
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🇨🇱 Desarrollado específicamente para pescadores artesanales chilenos</p>
          <p className="mt-1">Basado en datos oceanográficos de la corriente de Humboldt</p>
        </div>
      </div>
    </div>
  )
}