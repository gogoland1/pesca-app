'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, TestTube } from 'lucide-react'

export default function TideTestStatus() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestMode, setIsTestMode] = useState(false)

  useEffect(() => {
    // Verificar si el modo test está habilitado
    setIsTestMode(process.env.ENABLE_TIDE_TEST === 'true')
    
    // Cargar resultado del test desde localStorage
    try {
      const stored = localStorage.getItem('tide-api-test-result')
      if (stored) {
        setTestResult(JSON.parse(stored))
      }
    } catch (error) {
      console.log('No test result found')
    }
  }, [])

  if (!isTestMode && !testResult) return null

  return (
    <div className="mb-4 p-3 rounded-lg border bg-blue-50 border-blue-200">
      <div className="flex items-center space-x-2">
        <TestTube className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">
          Estado de APIs de Mareas
        </span>
      </div>
      
      {testResult ? (
        <div className="mt-2 flex items-center space-x-2">
          {testResult.success ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                ✅ Test exitoso - APIs funcionando
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                ❌ APIs no disponibles - Usando simulación
              </span>
            </>
          )}
          <span className="text-xs text-gray-500">
            ({new Date(testResult.timestamp).toLocaleString('es-CL')})
          </span>
        </div>
      ) : (
        <div className="mt-2 text-sm text-blue-700">
          🧪 Modo test activado - Se realizará una llamada de prueba
        </div>
      )}
      
      <div className="mt-2 text-xs text-blue-600">
        💡 Para activar datos reales: ENABLE_PREMIUM_TIDES=true
      </div>
    </div>
  )
}