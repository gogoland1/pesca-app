'use client'

import { useState, useEffect } from 'react'
import { AnalyticsFull } from '../components/AdvancedAnalytics'
import { ArrowLeft, BarChart3, Globe, Users, Eye, Lock, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authenticateAdmin, isAdminAuthenticated, clearAdminSession } from '../lib/admin-auth'

export default function AnalyticsPage() {
  const router = useRouter()
  const [showFullDetails, setShowFullDetails] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      setIsAuthenticated(isAdminAuthenticated())
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    const result = authenticateAdmin(password)
    if (result.success) {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      setAuthError(result.error || 'Error de autenticación')
    }
  }

  const handleLogout = () => {
    clearAdminSession()
    setIsAuthenticated(false)
    setPassword('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso de Administrador
            </h2>
            <p className="text-gray-600">
              Ingresa la contraseña para acceder a las estadísticas completas
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Acceder
            </button>
          </form>
          
          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

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
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
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