'use client'

import { useState } from 'react'
import { AnalyticsFull } from '../components/AdvancedAnalytics'
import { ArrowLeft, BarChart3, Globe, Users, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()
  const [showFullDetails, setShowFullDetails] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    Estadísticas de uso de Pesca App
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  showFullDetails 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showFullDetails ? 'Vista Simple' : 'Vista Detallada'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Main Analytics Component */}
          <AnalyticsFull 
            showDetails={showFullDetails}
            className="shadow-lg"
          />

          {/* Additional Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Alcance Global</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Pesca App está siendo utilizada por pescadores de diferentes países, 
                mostrando el alcance internacional de la aplicación.
              </p>
              <div className="text-xs text-gray-500">
                🌍 Datos actualizados en tiempo real
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Comunidad Activa</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                El sistema de monitoreo en tiempo real permite ver qué usuarios 
                están conectados y usando la aplicación actualmente.
              </p>
              <div className="text-xs text-gray-500">
                👥 Actualización cada 2 minutos
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Uso Responsable</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Los datos se recopilan de forma anónima respetando la privacidad 
                de los usuarios, solo con fines estadísticos.
              </p>
              <div className="text-xs text-gray-500">
                🔒 Privacidad protegida
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Información Técnica</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Fuentes de Datos</h4>
                <ul className="space-y-1">
                  <li>• Geolocalización: ipapi.co (gratuito)</li>
                  <li>• Almacenamiento: JSON local en servidor</li>
                  <li>• Detección de sesiones: localStorage + sessionStorage</li>
                  <li>• Heartbeat: cada 2 minutos para usuarios online</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Características</h4>
                <ul className="space-y-1">
                  <li>• Tracking de países por IP</li>
                  <li>• Usuarios online en tiempo real</li>
                  <li>• Historial de visitas por día</li>
                  <li>• Estadísticas por ubicación geográfica</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8">
            <div className="text-sm text-gray-500">
              <p className="mb-2">🎣 Pesca App Analytics Dashboard</p>
              <p>Desarrollado para monitorear el uso y alcance de la aplicación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}