'use client'

import { useState, useEffect } from 'react'
import { Waves, TrendingUp, TrendingDown, Minus, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react'

interface WaveDataPoint {
  latitude: number
  longitude: number
  distance_nm: number
  wave_height: number
  wave_period?: number
  wave_direction?: number
  source: string
  quality: 'high' | 'medium' | 'low'
}

interface WaveFrontProfile {
  coastal_point: {
    latitude: number
    longitude: number
  }
  measurements: WaveDataPoint[]
  gradient: {
    slope: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  calibrated_value: number
  confidence: number
  timestamp: string
}

interface WaveFrontProfileCardProps {
  latitude: number
  longitude: number
  onProfileLoad?: (profile: WaveFrontProfile) => void
}

export default function WaveFrontProfileCard({ latitude, longitude, onProfileLoad }: WaveFrontProfileCardProps) {
  const [profile, setProfile] = useState<WaveFrontProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWaveProfile()
  }, [latitude, longitude])

  const fetchWaveProfile = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`🌊 Fetching wave profile for ${latitude}, ${longitude}`)
      
      const response = await fetch(`/api/wave-profile?lat=${latitude}&lon=${longitude}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProfile(data)
        onProfileLoad?.(data)
        console.log(`✅ Wave profile loaded with ${data.measurements.length} measurements`)
      } else {
        throw new Error(data.error || 'Failed to load wave profile')
      }
      
    } catch (err) {
      console.error('Wave profile fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'high': return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'medium': return <AlertCircle className="h-3 w-3 text-yellow-500" />
      default: return <AlertCircle className="h-3 w-3 text-red-500" />
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      default: return 'text-red-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Minus className="h-4 w-4 text-blue-500" />
    }
  }

  const getWaveHeightColor = (height: number) => {
    if (height > 3) return 'text-red-600 font-bold'
    if (height > 2) return 'text-yellow-600 font-semibold'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-ocean-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Waves className="h-6 w-6 text-ocean-600 animate-pulse" />
          <h3 className="text-lg font-semibold text-ocean-800">Perfil Espacial de Oleaje</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600 mx-auto mb-4"></div>
          <p className="text-ocean-600">Analizando frente de ondas en múltiples distancias...</p>
          <p className="text-sm text-gray-500 mt-2">Integrando datos de múltiples fuentes</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Waves className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Error en Perfil de Oleaje</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={fetchWaveProfile}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="bg-white rounded-lg border border-ocean-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Waves className="h-6 w-6 text-ocean-600" />
          <div>
            <h3 className="text-lg font-semibold text-ocean-800">Perfil Espacial de Oleaje</h3>
            <p className="text-sm text-gray-600">Análisis multi-distancia del frente de ondas</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getWaveHeightColor(profile.calibrated_value)}`}>
            {profile.calibrated_value}m
          </div>
          <div className="text-xs text-gray-500">Valor calibrado</div>
        </div>
      </div>

      {/* Spatial Measurements */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Mediciones por Distancia</h4>
        <div className="space-y-3">
          {profile.measurements.map((measurement, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{measurement.distance_nm}nm</span>
                </div>
                <div>
                  <div className={`font-semibold ${getWaveHeightColor(measurement.wave_height)}`}>
                    {measurement.wave_height}m
                  </div>
                  <div className="text-xs text-gray-500">
                    {measurement.latitude.toFixed(4)}°, {measurement.longitude.toFixed(4)}°
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  {getQualityIcon(measurement.quality)}
                  <span className={`text-xs ${getQualityColor(measurement.quality)}`}>
                    {measurement.quality}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {measurement.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave Front Analysis */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
          {getTrendIcon(profile.gradient.trend)}
          <span className="ml-2">Análisis del Frente de Ondas</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Gradiente:</span>
            <span className="ml-2 font-medium">
              {profile.gradient.slope > 0 ? '+' : ''}{profile.gradient.slope} m/nm
            </span>
          </div>
          <div>
            <span className="text-gray-600">Tendencia:</span>
            <span className="ml-2 font-medium capitalize">
              {profile.gradient.trend === 'increasing' ? 'Creciente' :
               profile.gradient.trend === 'decreasing' ? 'Decreciente' : 'Estable'}
            </span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-blue-700">
          {profile.gradient.trend === 'increasing' && 
            "⚠️ Las olas aumentan hacia mar afuera - posible sistema meteorológico aproximándose"}
          {profile.gradient.trend === 'decreasing' && 
            "✅ Las olas disminuyen hacia la costa - condiciones normales de propagación"}
          {profile.gradient.trend === 'stable' && 
            "➡️ Oleaje uniforme - condiciones estables en toda la zona"}
        </div>
      </div>

      {/* Confidence and Data Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>Base: {profile.coastal_point.latitude.toFixed(4)}°, {profile.coastal_point.longitude.toFixed(4)}°</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(profile.timestamp).toLocaleTimeString('es-CL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs">
            Confianza: <span className="font-medium">{(profile.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            profile.confidence > 0.8 ? 'bg-green-500' :
            profile.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 text-center">
        <button
          onClick={fetchWaveProfile}
          className="text-sm text-ocean-600 hover:text-ocean-800 transition-colors"
        >
          🔄 Actualizar perfil
        </button>
      </div>
    </div>
  )
}