'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { Icon } from 'leaflet'
import { Fish, ArrowLeft, Navigation, Anchor, TrendingUp } from 'lucide-react'
import { NASAEarthdataService } from '../lib/nasa-earthdata'
import 'leaflet/dist/leaflet.css'

interface FishingSpot {
  id: string
  lat: number
  lon: number
  score: number
  chlorophyll: number
  depth: number
  description: string
  distance: number
}

interface FishingMapProps {
  onBack: () => void
}

export default function FishingMap({ onBack }: FishingMapProps) {
  const [fishingSpots, setFishingSpots] = useState<FishingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation] = useState({ lat: -33.0472, lon: -71.6127 }) // Valparaíso

  const nasaService = new NASAEarthdataService()

  useEffect(() => {
    loadFishingSpots()
  }, [])

  const loadFishingSpots = async () => {
    setLoading(true)
    try {
      // Generar spots de pesca en un radio de 20 millas náuticas
      const spots: FishingSpot[] = []
      const gridSize = 0.05 // ~5.5km
      
      for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
          const lat = userLocation.lat + (i * gridSize)
          const lon = userLocation.lon + (j * gridSize)
          
          const distance = calculateDistance(userLocation.lat, userLocation.lon, lat, lon)
          
          if (distance <= 37) { // 20 millas náuticas = ~37km
            const chlorophyllData = await nasaService.getChlorophyllData(lat, lon)
            
            if (chlorophyllData) {
              const score = calculateFishingScore(chlorophyllData.chlorophyll_a, distance)
              
              if (score > 0.3) { // Solo mostrar spots con score decente
                spots.push({
                  id: `spot-${i}-${j}`,
                  lat,
                  lon,
                  score,
                  chlorophyll: chlorophyllData.chlorophyll_a,
                  depth: getEstimatedDepth(distance),
                  description: getSpotDescription(score, chlorophyllData.chlorophyll_a),
                  distance
                })
              }
            }
          }
        }
      }
      
      // Ordenar por score descendente
      spots.sort((a, b) => b.score - a.score)
      setFishingSpots(spots.slice(0, 15)) // Mostrar solo los mejores 15
      
    } catch (error) {
      console.error('Error loading fishing spots:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const calculateFishingScore = (chlorophyll: number, distance: number): number => {
    let score = 0
    
    // Clorofila (factor principal)
    if (chlorophyll > 15) score += 0.9
    else if (chlorophyll > 8) score += 0.7
    else if (chlorophyll > 3) score += 0.5
    else if (chlorophyll > 1) score += 0.3
    else score += 0.1
    
    // Distancia (penalizar spots muy lejanos)
    const distanceFactor = Math.max(0, 1 - (distance / 40))
    score *= distanceFactor
    
    // Factores adicionales (simulados)
    const depthFactor = distance < 10 ? 0.8 : 1.2 // Más profundo = mejor
    const currentFactor = Math.random() * 0.3 + 0.85 // Corrientes favorables
    
    return Math.min(1, score * depthFactor * currentFactor)
  }

  const getEstimatedDepth = (distance: number): number => {
    // Estimación simple: más lejos = más profundo
    return Math.round(10 + (distance * 2))
  }

  const getSpotDescription = (score: number, chlorophyll: number): string => {
    if (score > 0.8) return 'Zona excelente - Alta actividad'
    if (score > 0.6) return 'Zona muy buena - Productiva'
    if (score > 0.4) return 'Zona buena - Moderada'
    return 'Zona regular'
  }

  const getMarkerColor = (score: number): string => {
    if (score > 0.8) return '#10B981' // Verde
    if (score > 0.6) return '#F59E0B' // Amarillo
    if (score > 0.4) return '#EF4444' // Rojo
    return '#6B7280' // Gris
  }

  const createCustomIcon = (color: string, score: number) => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">
            ${Math.round(score * 100)}
          </text>
        </svg>
      `)}`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    })
  }

  if (typeof window === 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ocean-50">
        <p className="text-ocean-700">Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-ocean-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between z-10">
        <button 
          onClick={onBack}
          className="flex items-center text-ocean-700 hover:text-ocean-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Zonas de Pesca</h1>
        <div className="flex items-center text-sm text-gray-600">
          <Fish className="h-4 w-4 mr-1" />
          {fishingSpots.length} spots
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 bg-ocean-50 flex items-center justify-center z-10">
            <div className="text-center">
              <Navigation className="h-8 w-8 text-ocean-600 mx-auto animate-spin mb-2" />
              <p className="text-ocean-700">Analizando zonas de pesca...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[userLocation.lat, userLocation.lon]}
            zoom={11}
            className="h-full w-full z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {/* Límite de 20 millas náuticas */}
            <Circle
              center={[userLocation.lat, userLocation.lon]}
              radius={37000} // 37km = 20 millas náuticas
              pathOptions={{
                color: '#0EA5E9',
                fillColor: '#0EA5E9',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }}
            />

            {/* Ubicación del usuario */}
            <Marker 
              position={[userLocation.lat, userLocation.lon]}
              icon={new Icon({
                iconUrl: `data:image/svg+xml;base64,${btoa(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#DC2626" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `)}`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>
                <div className="text-center">
                  <Anchor className="h-4 w-4 mx-auto mb-1 text-red-600" />
                  <p className="font-semibold">Tu ubicación</p>
                  <p className="text-xs text-gray-600">Puerto base</p>
                </div>
              </Popup>
            </Marker>

            {/* Spots de pesca */}
            {fishingSpots.map((spot) => (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lon]}
                icon={createCustomIcon(getMarkerColor(spot.score), spot.score)}
              >
                <Popup>
                  <div className="text-center min-w-48">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                      <span className="font-semibold">Score: {Math.round(spot.score * 100)}%</span>
                    </div>
                    <p className="text-sm font-medium mb-2">{spot.description}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p><strong>Clorofila:</strong> {spot.chlorophyll.toFixed(1)} mg/m³</p>
                      <p><strong>Profundidad est.:</strong> {spot.depth}m</p>
                      <p><strong>Distancia:</strong> {spot.distance.toFixed(1)} km</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Coord: {spot.lat.toFixed(4)}°, {spot.lon.toFixed(4)}°
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-white p-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Excelente (80%+)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>Buena (60-80%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>Regular (40-60%)</span>
            </div>
          </div>
          <div className="text-gray-500">
            Límite: 20 millas náuticas
          </div>
        </div>
      </div>
    </div>
  )
}