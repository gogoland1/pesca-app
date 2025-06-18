interface APICallRecord {
  timestamp: number
  service: 'open-meteo' | 'openweather' | 'copernicus' | 'satellite' | 'noaa' | 'other'
  endpoint: string
  success: boolean
  cached?: boolean
}

interface APILimits {
  'open-meteo': {
    perMinute: 600
    perHour: 5000
    perDay: 10000
    perMonth: 300000
  }
  'openweather': {
    perMinute: 60
    perDay: 1000
    perMonth: 60000
  }
  'copernicus': {
    perMinute: 10
    perHour: 200
    perDay: 1000
    perMonth: 10000
  }
  'satellite': {
    perMinute: 5
    perHour: 100
    perDay: 500
    perMonth: 5000
  }
  'noaa': {
    perMinute: 30
    perHour: 500
    perDay: 2000
    perMonth: 20000
  }
}

export class APICallMonitor {
  private static instance: APICallMonitor
  private calls: APICallRecord[] = []
  private readonly STORAGE_KEY = 'pesca-app-api-calls'
  private readonly limits: APILimits = {
    'open-meteo': {
      perMinute: 600,
      perHour: 5000,
      perDay: 10000,
      perMonth: 300000
    },
    'openweather': {
      perMinute: 60,
      perDay: 1000,
      perMonth: 60000
    },
    'copernicus': {
      perMinute: 10,
      perHour: 200,
      perDay: 1000,
      perMonth: 10000
    },
    'satellite': {
      perMinute: 5,
      perHour: 100,
      perDay: 500,
      perMonth: 5000
    },
    'noaa': {
      perMinute: 30,
      perHour: 500,
      perDay: 2000,
      perMonth: 20000
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
      this.cleanup() // Limpiar calls antiguos
    }
  }

  static getInstance(): APICallMonitor {
    if (!APICallMonitor.instance) {
      APICallMonitor.instance = new APICallMonitor()
    }
    return APICallMonitor.instance
  }

  // Registrar una nueva llamada API
  recordCall(service: APICallRecord['service'], endpoint: string, success: boolean, cached: boolean = false): void {
    const call: APICallRecord = {
      timestamp: Date.now(),
      service,
      endpoint,
      success,
      cached
    }

    this.calls.push(call)
    this.saveToStorage()

    // Log para debugging
    console.log(`📡 API Call: ${service} ${success ? '✅' : '❌'} ${cached ? '(cached)' : '(fresh)'} - ${endpoint}`)
    
    // Mostrar warnings si se acerca a límites
    this.checkLimits(service)
  }

  // Verificar si se puede hacer una llamada
  canMakeCall(service: APICallRecord['service']): { allowed: boolean, reason?: string } {
    const now = Date.now()
    const serviceCalls = this.calls.filter(call => 
      call.service === service && 
      call.success && 
      !call.cached
    )

    const limits = this.limits[service as keyof APILimits]
    if (!limits) return { allowed: true }

    // Verificar límite por minuto
    const lastMinute = serviceCalls.filter(call => now - call.timestamp < 60 * 1000)
    if (lastMinute.length >= limits.perMinute) {
      return { allowed: false, reason: `Límite por minuto alcanzado (${limits.perMinute})` }
    }

    // Verificar límite por hora
    if ('perHour' in limits) {
      const lastHour = serviceCalls.filter(call => now - call.timestamp < 60 * 60 * 1000)
      if (lastHour.length >= limits.perHour) {
        return { allowed: false, reason: `Límite por hora alcanzado (${limits.perHour})` }
      }
    }

    // Verificar límite por día
    const lastDay = serviceCalls.filter(call => now - call.timestamp < 24 * 60 * 60 * 1000)
    if (lastDay.length >= limits.perDay) {
      return { allowed: false, reason: `Límite diario alcanzado (${limits.perDay})` }
    }

    // Verificar límite por mes
    const lastMonth = serviceCalls.filter(call => now - call.timestamp < 30 * 24 * 60 * 60 * 1000)
    if (lastMonth.length >= limits.perMonth) {
      return { allowed: false, reason: `Límite mensual alcanzado (${limits.perMonth})` }
    }

    return { allowed: true }
  }

  // Obtener estadísticas de uso
  getUsageStats(service?: APICallRecord['service']) {
    const now = Date.now()
    const calls = service 
      ? this.calls.filter(call => call.service === service)
      : this.calls

    const successfulCalls = calls.filter(call => call.success && !call.cached)
    const cachedCalls = calls.filter(call => call.cached)

    return {
      total: calls.length,
      successful: successfulCalls.length,
      cached: cachedCalls.length,
      failed: calls.filter(call => !call.success).length,
      lastMinute: successfulCalls.filter(call => now - call.timestamp < 60 * 1000).length,
      lastHour: successfulCalls.filter(call => now - call.timestamp < 60 * 60 * 1000).length,
      lastDay: successfulCalls.filter(call => now - call.timestamp < 24 * 60 * 60 * 1000).length,
      lastMonth: successfulCalls.filter(call => now - call.timestamp < 30 * 24 * 60 * 60 * 1000).length,
      limits: service ? this.limits[service as keyof APILimits] : null
    }
  }

  // Obtener estadísticas por servicio
  getAllServicesStats() {
    const services = ['open-meteo', 'openweather', 'copernicus', 'satellite', 'noaa'] as const
    const stats: Record<string, any> = {}

    services.forEach(service => {
      stats[service] = this.getUsageStats(service)
    })

    return stats
  }

  // Verificar límites y mostrar warnings
  private checkLimits(service: APICallRecord['service']): void {
    const stats = this.getUsageStats(service)
    const limits = this.limits[service as keyof APILimits]
    
    if (!limits) return

    // Warning por día
    const dayUsagePercent = (stats.lastDay / limits.perDay) * 100
    if (dayUsagePercent >= 80) {
      console.warn(`⚠️ ${service}: ${dayUsagePercent.toFixed(1)}% del límite diario usado (${stats.lastDay}/${limits.perDay})`)
    }

    // Warning por mes
    const monthUsagePercent = (stats.lastMonth / limits.perMonth) * 100
    if (monthUsagePercent >= 80) {
      console.warn(`⚠️ ${service}: ${monthUsagePercent.toFixed(1)}% del límite mensual usado (${stats.lastMonth}/${limits.perMonth})`)
    }
  }

  // Limpiar registros antiguos (más de 31 días)
  private cleanup(): void {
    const oneMonthAgo = Date.now() - (31 * 24 * 60 * 60 * 1000)
    this.calls = this.calls.filter(call => call.timestamp > oneMonthAgo)
    this.saveToStorage()
  }

  // Persistir en localStorage
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.calls))
      } catch (error) {
        console.warn('Error saving API call records:', error)
      }
    }
  }

  // Cargar desde localStorage
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          this.calls = JSON.parse(stored)
        }
      } catch (error) {
        console.warn('Error loading API call records:', error)
        this.calls = []
      }
    }
  }

  // Resetear contadores (para testing o nueva cuenta)
  resetCounters(): void {
    this.calls = []
    this.saveToStorage()
    console.log('🔄 API call counters reset')
  }

  // Exportar estadísticas para debugging
  exportStats(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      totalCalls: this.calls.length,
      services: this.getAllServicesStats()
    }, null, 2)
  }
}

export default APICallMonitor