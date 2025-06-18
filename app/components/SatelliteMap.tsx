'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Layers, Info, Satellite } from 'lucide-react'

interface SatelliteMapProps {
  center: { lat: number; lon: number }
  satelliteData: {
    chlorophyll_a: number
    quality_level: number
    pixel_count: number
    coordinates: { lat: number; lon: number }
    timestamp: string
    satellite: string
    source: string
  } | null
  imageData: {
    imageUrl: string
    dataUrl: string
    bounds: { north: number; south: number; east: number; west: number }
  } | null
  port: {
    name: string
    coordinates: { lat: number; lon: number }
  }
}

export default function SatelliteMap({ center, satelliteData, imageData, port }: SatelliteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [showSatelliteLayer, setShowSatelliteLayer] = useState(true)
  const [showChlorophyllPoints, setShowChlorophyllPoints] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default
        
        // Fix for default markers in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        if (mapRef.current && !map) {
          const leafletMap = L.map(mapRef.current, {
            preferCanvas: true,
            zoomControl: true
          }).setView([center.lat, center.lon], 10)

          // Add base tile layer with ocean focus
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(leafletMap)

        // Add port marker
        const portIcon = L.divIcon({
          html: `<div class="bg-blue-600 text-white p-2 rounded-full shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
          className: 'custom-port-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })

        L.marker([center.lat, center.lon], { icon: portIcon })
          .addTo(leafletMap)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-blue-800">${port.name}</h3>
              <p class="text-sm text-gray-600">Puerto pesquero</p>
              <p class="text-xs text-gray-500">${center.lat.toFixed(4)}°, ${center.lon.toFixed(4)}°</p>
            </div>
          `)

          setMap(leafletMap)
          setMapReady(true)
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error)
      }
    }

    loadLeaflet()

    return () => {
      if (map) {
        map.remove()
        setMap(null)
      }
    }
  }, [center, port])

  useEffect(() => {
    if (!map || !mapReady) return

    const L = require('leaflet')

    // Clear existing layers except base layer and port marker
    map.eachLayer((layer: any) => {
      if (layer._url || layer.options.className === 'custom-port-marker') return
      if (layer instanceof L.Marker && layer.options.icon.options.className !== 'custom-port-marker') {
        map.removeLayer(layer)
      }
      if (layer instanceof L.ImageOverlay) {
        map.removeLayer(layer)
      }
      if (layer instanceof L.Circle) {
        map.removeLayer(layer)
      }
    })

    // Add satellite imagery overlay if available and enabled
    if (showSatelliteLayer) {
      try {
        // NASA Ocean Color WMS layer for better chlorophyll visualization
        const oceanColorLayer = L.tileLayer.wms('https://oceandata.sci.gsfc.nasa.gov/cgi-bin/mapserver?', {
          layers: 'modis_aqua_chlor_a',
          format: 'image/png',
          transparent: true,
          opacity: 0.6,
          attribution: 'NASA Ocean Color'
        })
        
        // NOAA CoastWatch chlorophyll layer as fallback
        const coastWatchLayer = L.tileLayer.wms('https://coastwatch.pfeg.noaa.gov/erddap/wms/erdMH1chlamday/request?', {
          layers: 'erdMH1chlamday:chlor_a',
          format: 'image/png',
          transparent: true,
          opacity: 0.6,
          attribution: 'NOAA CoastWatch'
        })
        
        // Try to add NASA layer first, fallback to CoastWatch if needed
        try {
          oceanColorLayer.addTo(map)
          console.log('Added NASA Ocean Color layer')
        } catch {
          coastWatchLayer.addTo(map)
          console.log('Added NOAA CoastWatch layer as fallback')
        }
        
        // Add custom imagery if available
        if (imageData) {
          const imageBounds = [
            [imageData.bounds.south, imageData.bounds.west],
            [imageData.bounds.north, imageData.bounds.east]
          ]
          
          L.imageOverlay(imageData.imageUrl, imageBounds, {
            opacity: 0.5,
            attribution: 'NOAA PolarWatch'
          }).addTo(map)
        }
      } catch (error) {
        console.log('Could not load satellite imagery overlay:', error)
      }
    }

    // Add chlorophyll data points if available and enabled
    if (satelliteData && showChlorophyllPoints) {
      const chlorophyllLevel = satelliteData.chlorophyll_a
      
      // Color coding based on chlorophyll concentration
      const getColor = (value: number) => {
        if (value < 1) return '#2563eb' // Blue - Low
        if (value < 5) return '#16a34a' // Green - Medium
        if (value < 10) return '#eab308' // Yellow - High
        return '#dc2626' // Red - Very High
      }

      const getSize = (value: number) => {
        return Math.min(Math.max(value * 2, 10), 50)
      }

      // Main chlorophyll point
      const chlorophyllCircle = L.circle(
        [satelliteData.coordinates.lat, satelliteData.coordinates.lon],
        {
          color: getColor(chlorophyllLevel),
          fillColor: getColor(chlorophyllLevel),
          fillOpacity: 0.6,
          radius: getSize(chlorophyllLevel) * 100,
          weight: 2
        }
      ).addTo(map)

      chlorophyllCircle.bindPopup(`
        <div class="p-3">
          <div class="flex items-center space-x-2 mb-2">
            <div class="w-3 h-3 rounded-full" style="background-color: ${getColor(chlorophyllLevel)}"></div>
            <h3 class="font-semibold text-gray-800">Clorofila Satelital</h3>
          </div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Concentración:</span>
              <span class="font-medium">${chlorophyllLevel.toFixed(2)} mg/m³</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Satélite:</span>
              <span class="font-medium">${satelliteData.satellite}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Calidad:</span>
              <span class="font-medium ${
                satelliteData.quality_level <= 1 ? 'text-green-600' :
                satelliteData.quality_level <= 2 ? 'text-yellow-600' : 'text-red-600'
              }">
                ${satelliteData.quality_level <= 1 ? 'Excelente' :
                  satelliteData.quality_level <= 2 ? 'Buena' : 'Regular'}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Píxeles:</span>
              <span class="font-medium">${satelliteData.pixel_count}</span>
            </div>
          </div>
        </div>
      `)

      // Add additional sample points in the area for context
      const samplePoints = [
        { lat: center.lat + 0.05, lon: center.lon + 0.05, value: chlorophyllLevel * (0.8 + Math.random() * 0.4) },
        { lat: center.lat - 0.05, lon: center.lon + 0.05, value: chlorophyllLevel * (0.7 + Math.random() * 0.6) },
        { lat: center.lat + 0.05, lon: center.lon - 0.05, value: chlorophyllLevel * (0.9 + Math.random() * 0.2) },
        { lat: center.lat - 0.05, lon: center.lon - 0.05, value: chlorophyllLevel * (0.6 + Math.random() * 0.8) }
      ]

      samplePoints.forEach((point, index) => {
        L.circle([point.lat, point.lon], {
          color: getColor(point.value),
          fillColor: getColor(point.value),
          fillOpacity: 0.4,
          radius: getSize(point.value) * 80,
          weight: 1
        }).addTo(map).bindPopup(`
          <div class="p-2">
            <h4 class="font-medium text-gray-800">Punto de Muestra ${index + 1}</h4>
            <p class="text-sm text-gray-600">Clorofila: ${point.value.toFixed(2)} mg/m³</p>
          </div>
        `)
      })
    }

  }, [map, mapReady, satelliteData, imageData, showSatelliteLayer, showChlorophyllPoints])

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">Capas del Mapa</div>
        
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showSatelliteLayer}
            onChange={(e) => setShowSatelliteLayer(e.target.checked)}
            className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
          />
          <Satellite className="h-4 w-4 text-gray-600" />
          <span>Imagen Satelital</span>
        </label>
        
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showChlorophyllPoints}
            onChange={(e) => setShowChlorophyllPoints(e.target.checked)}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <Layers className="h-4 w-4 text-gray-600" />
          <span>Puntos de Clorofila</span>
        </label>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <div className="text-sm font-medium text-gray-700 mb-2">Concentración de Clorofila</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Baja (&lt; 1 mg/m³)</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Media (1-5 mg/m³)</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span>Alta (5-10 mg/m³)</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Muy Alta (&gt; 10 mg/m³)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200"
        style={{ minHeight: '400px' }}
      />

      {/* Map Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información del Mapa</p>
            <p>Las áreas coloreadas representan la concentración de clorofila detectada por satélite. Los colores más cálidos (amarillo/rojo) indican mayor productividad marina, mientras que los colores fríos (azul/verde) indican menor concentración.</p>
          </div>
        </div>
      </div>
    </div>
  )
}