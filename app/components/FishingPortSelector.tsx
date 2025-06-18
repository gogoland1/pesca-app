'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { CHILEAN_FISHING_PORTS, type FishingPort } from '../data/fishing-ports'

interface FishingPortSelectorProps {
  onPortChange: (port: FishingPort) => void
  currentPort?: FishingPort
}

export default function FishingPortSelector({ onPortChange, currentPort }: FishingPortSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPorts, setFilteredPorts] = useState<FishingPort[]>([])
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)


  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredPorts([])
      setShowSuggestion(false)
      return
    }

    const searchLower = searchTerm.toLowerCase().trim()
    
    // Función para calcular score de coincidencia
    const calculateMatchScore = (port: FishingPort): number => {
      const name = port.name.toLowerCase()
      const region = port.region.toLowerCase()
      let score = 0
      
      // Coincidencia exacta al inicio del nombre (máxima prioridad)
      if (name.startsWith(searchLower)) {
        score += 100
      }
      
      // Coincidencia al inicio de cualquier palabra en el nombre
      const nameWords = name.split(/[\s\-(),]+/)
      for (const word of nameWords) {
        if (word.startsWith(searchLower)) {
          score += 80
        }
      }
      
      // Coincidencia parcial en el nombre
      if (name.includes(searchLower)) {
        score += 60
      }
      
      // Coincidencia en región
      if (region.includes(searchLower)) {
        score += 40
      }
      
      // Coincidencia en especies
      for (const species of port.mainSpecies) {
        if (species.toLowerCase().includes(searchLower)) {
          score += 20
        }
      }
      
      // Coincidencia en tipo de puerto
      if (port.portType.toLowerCase().includes(searchLower)) {
        score += 30
      }
      
      // Bonus por puertos más importantes
      if (port.portType === 'puerto') {
        score += 10
      }
      
      return score
    }
    
    // Buscar y puntuar todos los puertos
    const scoredPorts = CHILEAN_FISHING_PORTS
      .map(port => ({
        port,
        score: calculateMatchScore(port)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => {
        // Ordenar por score descendente, luego alfabéticamente
        if (b.score !== a.score) return b.score - a.score
        return a.port.name.localeCompare(b.port.name)
      })
      .map(item => item.port)

    // Mostrar hasta 3 resultados para mejor UX
    setFilteredPorts(scoredPorts.slice(0, 3))
    setShowSuggestion(scoredPorts.length > 0)
    setSelectedIndex(0) // Reset selection index
    
    // Auto-seleccionar solo si hay coincidencia exacta completa
    const exactMatch = scoredPorts.find(port => 
      port.name.toLowerCase() === searchLower ||
      port.name.toLowerCase().replace(/[^\w\s]/g, '') === searchLower.replace(/[^\w\s]/g, '')
    )
    
    // Evitar auto-selección muy rápida, solo cuando el usuario para de escribir
    if (exactMatch && searchTerm.length >= 3) {
      const timeoutId = setTimeout(() => {
        if (searchTerm === exactMatch.name.substring(0, searchTerm.length)) {
          // Solo auto-seleccionar si la búsqueda sigue siendo válida
          return // Comentado para evitar auto-selección no deseada
        }
      }, 800)
      
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])

  // Función para resaltar coincidencias en el texto
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-medium">{part}</mark>
      ) : (
        part
      )
    )
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestion || filteredPorts.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredPorts.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev === 0 ? filteredPorts.length - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredPorts[selectedIndex]) {
          handlePortSelect(filteredPorts[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestion(false)
        setSearchTerm('')
        break
    }
  }

  const handlePortSelect = (port: FishingPort) => {
    onPortChange(port)
    setSearchTerm('')
    setShowSuggestion(false)
  }

  const getPortTypeIcon = (type: string) => {
    switch (type) {
      case 'puerto': return '🚢'
      case 'caleta': return '🎣'
      case 'bahia': return '🏊'
      default: return '📍'
    }
  }

  const getPortTypeLabel = (type: string) => {
    switch (type) {
      case 'puerto': return 'Puerto'
      case 'caleta': return 'Caleta'
      case 'bahia': return 'Bahía'
      default: return 'Ubicación'
    }
  }

  return (
    <div className="relative w-full">
      {/* Selector actual */}
      {currentPort && (
        <div className="mb-4 p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getPortTypeIcon(currentPort.portType)}</div>
            <div>
              <div className="font-medium text-gray-900">{currentPort.name}</div>
              <div className="text-sm text-gray-600">
                {currentPort.region} • {getPortTypeLabel(currentPort.portType)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Escribe el nombre de tu caleta o puerto..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            autoComplete="off"
          />
        </div>

        {/* Sugerencias mejoradas */}
        {showSuggestion && filteredPorts.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
            <div className="p-2 bg-gray-50 border-b text-xs text-gray-600">
              {filteredPorts.length} resultado{filteredPorts.length !== 1 ? 's' : ''} encontrado{filteredPorts.length !== 1 ? 's' : ''}
            </div>
            {filteredPorts.map((port, index) => (
              <button
                key={port.id}
                onClick={() => handlePortSelect(port)}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors ${
                  index === selectedIndex ? 'bg-blue-100 border-l-4 border-ocean-500' : ''
                } ${index !== filteredPorts.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-lg mt-0.5">{getPortTypeIcon(port.portType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">
                      {highlightMatch(port.name, searchTerm)}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      📍 {highlightMatch(port.region, searchTerm)} • {getPortTypeLabel(port.portType)}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {port.description}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {port.mainSpecies.slice(0, 3).map((species, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                        >
                          {highlightMatch(species, searchTerm)}
                        </span>
                      ))}
                      {port.mainSpecies.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{port.mainSpecies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            {/* Footer con sugerencias */}
            <div className="p-2 bg-gray-50 border-t text-xs text-gray-500">
              💡 Prueba escribir: nombre, región, especie o tipo de puerto
            </div>
          </div>
        )}
        
        {/* Mensaje de ayuda */}
        {searchTerm.length === 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-medium mb-2">💡 Búsqueda inteligente - Prueba escribir:</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-medium text-blue-600">Por nombre:</p>
                <p>"Arica", "Valparaíso", "Caldera"</p>
              </div>
              <div>
                <p className="font-medium text-green-600">Por región:</p>
                <p>"Los Lagos", "Biobío"</p>
              </div>
              <div>
                <p className="font-medium text-purple-600">Por especie:</p>
                <p>"Merluza", "Congrio"</p>
              </div>
              <div>
                <p className="font-medium text-orange-600">Por tipo:</p>
                <p>"Puerto", "Caleta"</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              ⌨️ Usa ↑↓ para navegar, Enter para seleccionar, Esc para limpiar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}