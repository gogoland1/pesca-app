'use client'

import { Droplets, Activity, AlertTriangle, CheckCircle } from 'lucide-react'

interface ChlorophyllCardProps {
  data: {
    chlorophyll_a: number
    quality_level: number
    pixel_count: number
    coordinates: { lat: number; lon: number }
    timestamp: string
    satellite: string
    source: string
  } | null
  marineData?: any
}

export default function ChlorophyllCard({ data, marineData }: ChlorophyllCardProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  const chlorophyllLevel = data.chlorophyll_a
  
  // Determine productivity level and color scheme
  const getProductivityInfo = (value: number) => {
    if (value < 1) {
      return {
        level: 'Muy Baja',
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        description: 'Aguas oligotróficas - Baja productividad',
        fishingAdvice: 'Condiciones de pesca limitadas'
      }
    } else if (value < 5) {
      return {
        level: 'Baja',
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-800',
        iconColor: 'text-indigo-600',
        description: 'Aguas con productividad moderada',
        fishingAdvice: 'Condiciones regulares para pesca'
      }
    } else if (value < 10) {
      return {
        level: 'Media',
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        description: 'Aguas productivas - Buena actividad biológica',
        fishingAdvice: 'Condiciones favorables para pesca'
      }
    } else if (value < 20) {
      return {
        level: 'Alta',
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        description: 'Aguas muy productivas - Alta actividad',
        fishingAdvice: 'Excelentes condiciones para pesca'
      }
    } else {
      return {
        level: 'Muy Alta',
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        description: 'Aguas hiperproductivas - Posible bloom',
        fishingAdvice: 'Verificar condiciones antes de pescar'
      }
    }
  }

  const productivityInfo = getProductivityInfo(chlorophyllLevel)

  // Quality indicator
  const getQualityInfo = (qualityLevel: number) => {
    if (qualityLevel <= 1) {
      return {
        text: 'Excelente',
        icon: CheckCircle,
        color: 'text-green-600',
        description: 'Datos de alta confiabilidad'
      }
    } else if (qualityLevel <= 2) {
      return {
        text: 'Buena',
        icon: CheckCircle,
        color: 'text-blue-600',
        description: 'Datos confiables'
      }
    } else {
      return {
        text: 'Regular',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        description: 'Datos con limitaciones'
      }
    }
  }

  const qualityInfo = getQualityInfo(data.quality_level)
  const QualityIcon = qualityInfo.icon

  return (
    <div className={`rounded-xl shadow-lg p-6 ${productivityInfo.bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Droplets className={`h-6 w-6 ${productivityInfo.iconColor}`} />
          <div>
            <h3 className={`text-lg font-semibold ${productivityInfo.textColor}`}>
              Productividad del Agua
            </h3>
            <p className="text-sm text-gray-600">Datos satelitales</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <QualityIcon className={`h-5 w-5 ${qualityInfo.color}`} />
          <span className={`text-sm font-medium ${qualityInfo.color}`}>
            {qualityInfo.text}
          </span>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl font-bold ${productivityInfo.textColor}`}>
            {chlorophyllLevel.toFixed(2)}
          </span>
          <span className="text-sm text-gray-600">mg/m³</span>
        </div>
        <div className={`text-sm font-medium mt-1 ${productivityInfo.textColor}`}>
          Productividad: {productivityInfo.level}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>0</span>
          <span>10</span>
          <span>20+ mg/m³</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              productivityInfo.color === 'blue' ? 'bg-blue-500' :
              productivityInfo.color === 'indigo' ? 'bg-indigo-500' :
              productivityInfo.color === 'green' ? 'bg-green-500' :
              productivityInfo.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((chlorophyllLevel / 20) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          {productivityInfo.description}
        </p>
        <div className={`flex items-center space-x-2 text-sm font-medium ${productivityInfo.textColor}`}>
          <Activity className="h-4 w-4" />
          <span>{productivityInfo.fishingAdvice}</span>
        </div>
      </div>

      {/* Fishing Recommendation */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start space-x-2">
          <Activity className="h-4 w-4 mt-0.5 text-ocean-600" />
          <div>
            <div className="text-sm font-medium text-gray-800 mb-1">
              Recomendación para Pesca
            </div>
            <div className="text-sm text-gray-600">
              {chlorophyllLevel > 8 ? 'Zona muy productiva. Excelente para pesca pelágica (anchoveta, sardina, jurel).' :
               chlorophyllLevel > 4 ? 'Buena productividad. Favorable para pesca de especies medias.' :
               chlorophyllLevel > 1.5 ? 'Productividad moderada. Considerar pesca más selectiva.' :
               'Baja productividad. Buscar otras zonas o esperar mejores condiciones.'}
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <span className="font-medium">Fuente satelital:</span> {data.satellite}
          <span className="mx-2">•</span>
          <span>{new Date(data.timestamp).toLocaleDateString('es-CL')}</span>
        </div>
      </div>

      {/* Comparison with Temperature (if available) */}
      {marineData?.weather?.main?.temp && (
        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Relación con temperatura</div>
          <div className="text-sm">
            {marineData.weather.main.temp < 15 && chlorophyllLevel > 5 ? (
              <span className="text-green-700 font-medium">
                ✓ Upwelling activo - Condiciones ideales
              </span>
            ) : marineData.weather.main.temp > 18 && chlorophyllLevel < 3 ? (
              <span className="text-blue-700 font-medium">
                → Aguas cálidas - Menor productividad
              </span>
            ) : (
              <span className="text-gray-700">
                → Condiciones normales
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}