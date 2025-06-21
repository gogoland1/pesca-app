'use client'

import { useState } from 'react'
import { Waves, Fish, Anchor, ArrowRight, ExternalLink } from 'lucide-react'
import FishingPortSelector from './FishingPortSelector'
import { PublicCounterMinimal } from './PublicVisitCounter'
import type { FishingPort } from '../data/fishing-ports'

interface LandingPageProps {
  onPortSelected: (port: FishingPort) => void
}

export default function LandingPage({ onPortSelected }: LandingPageProps) {
  const [selectedPort, setSelectedPort] = useState<FishingPort | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePortChange = (port: FishingPort) => {
    setSelectedPort(port)
  }

  const handleContinue = () => {
    if (selectedPort) {
      setIsAnimating(true)
      // Pequeña animación antes de cargar los datos
      setTimeout(() => {
        onPortSelected(selectedPort)
      }, 800)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo de océano animado */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-500 to-blue-900">
        {/* Ondas animadas */}
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" 
              fill="rgba(255,255,255,0.1)"
              className="animate-pulse"
            />
          </svg>
          <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,80 C300,20 600,100 900,40 C1050,60 1150,80 1200,40 L1200,120 L0,120 Z" 
              fill="rgba(255,255,255,0.05)"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>

        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-40 animate-bounce" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-25 animate-bounce" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full opacity-35 animate-bounce" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className={`max-w-2xl mx-auto text-center transition-all duration-800 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
          
          {/* Logo/Título */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Anchor className="h-12 w-12 text-white drop-shadow-lg" />
              <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                PescaApp
              </h1>
              <Fish className="h-12 w-12 text-white drop-shadow-lg" />
            </div>
            <p className="text-xl md:text-2xl text-blue-100 drop-shadow">
              Para Pescadores Artesanales de Chile
            </p>
          </div>

          {/* Mensaje de bienvenida */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <Waves className="h-8 w-8 text-blue-200 mr-3" />
              <h2 className="text-2xl md:text-3xl font-semibold text-white drop-shadow">
                Bienvenido
              </h2>
              <Waves className="h-8 w-8 text-blue-200 ml-3" />
            </div>
            <p className="text-lg md:text-xl text-blue-100 drop-shadow mb-6">
              ¿Dónde quieres pescar hoy?
            </p>
            <p className="text-sm text-blue-200 drop-shadow">
              Selecciona tu caleta o puerto para obtener condiciones meteorológicas y oceanográficas en tiempo real
            </p>
          </div>

          {/* Selector de caletas */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🎣 Selecciona tu Caleta o Puerto
              </h3>
              <p className="text-sm text-gray-600">
                Más de 40 ubicaciones desde Arica hasta Puerto Williams
              </p>
            </div>
            
            <FishingPortSelector 
              onPortChange={handlePortChange}
              currentPort={selectedPort || undefined}
            />
          </div>

          {/* Botón continuar */}
          {selectedPort && (
            <div className="animate-fadeIn">
              <button
                onClick={handleContinue}
                disabled={isAnimating}
                className="bg-ocean-600 hover:bg-ocean-700 disabled:bg-ocean-400 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 transition-all duration-300 flex items-center space-x-3 mx-auto"
              >
                <span>Ver Condiciones del Mar</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-blue-100 text-sm drop-shadow">
                  📍 <strong>{selectedPort.name}</strong> • {selectedPort.region}
                </p>
                <p className="text-blue-200 text-xs mt-1 drop-shadow">
                  {selectedPort.coordinates.lat.toFixed(4)}°, {selectedPort.coordinates.lon.toFixed(4)}°
                </p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          {!selectedPort && (
            <div className="mt-8 text-center">
              <p className="text-blue-200 text-sm drop-shadow">
                💡 Datos en tiempo real desde fuentes oficiales
              </p>
              <div className="flex justify-center space-x-6 mt-3 text-xs text-blue-200">
                <span>🌤️ OpenWeatherMap</span>
                <span>🛰️ Satélites NOAA</span>
                <span>🌊 Copernicus Marine</span>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay cuando está cargando */}
        {isAnimating && (
          <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-xl font-medium drop-shadow">
                Obteniendo condiciones del mar...
              </p>
              <p className="text-blue-200 text-sm mt-2 drop-shadow">
                {selectedPort?.name} • {selectedPort?.region}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer minimalista */}
      <div className="absolute bottom-4 left-0 right-0 text-center space-y-3">
        <a
          href="https://gogoland1.github.io/olitai.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/20 hover:scale-105"
        >
          <ExternalLink className="h-3 w-3" />
          <div className="text-left">
            <div className="text-sm font-medium">Visita Olitai Project!</div>
            <div className="text-xs text-blue-200">mi otro proyecto</div>
          </div>
        </a>
        
        <div className="flex flex-col items-center space-y-3">
          <PublicCounterMinimal className="text-blue-200" />
          <span className="text-blue-200 text-xs">
            🇨🇱 Desarrollado para pescadores artesanales chilenos
          </span>
        </div>
      </div>
    </div>
  )
}

// Agregar estilos de animación personalizados
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
`

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}