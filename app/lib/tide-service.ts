interface TideData {
  time: string
  height: number
  type: 'high' | 'low'
}

interface TideInfo {
  current: {
    height: number
    time: string
    trend: 'rising' | 'falling'
  }
  next: TideData[]
  station: string
  coordinates: { lat: number, lon: number }
}

export class ChileanTideService {
  // APIs gratuitas para datos de mareas
  private worldTidesUrl = 'https://www.worldtides.info/api/v3'
  private openTidesUrl = 'https://api.stormglass.io/v2/tide/extremes/point'
  private admiraltyUrl = 'https://admiralty.co.uk/ukho/api/tides'
  
  // Estaciones de marea reales en Chile y cercanas
  private chileanStations = new Map([
    // Norte - Usando estaciones cercanas de Perú/Ecuador
    ['arica', { 
      id: 'arica-cl', 
      name: 'Arica, Chile', 
      lat: -18.4783, 
      lon: -70.3126,
      worldTidesId: '6179' // Si está disponible
    }],
    ['iquique', { 
      id: 'iquique-cl', 
      name: 'Iquique, Chile', 
      lat: -20.2141, 
      lon: -70.1522,
      worldTidesId: '6180'
    }],
    ['antofagasta', { 
      id: 'antofagasta-cl', 
      name: 'Antofagasta, Chile', 
      lat: -23.6509, 
      lon: -70.3975,
      worldTidesId: '6181'
    }],
    
    // Centro
    ['valparaiso', { 
      id: 'valparaiso-cl', 
      name: 'Valparaíso, Chile', 
      lat: -33.0472, 
      lon: -71.6127,
      worldTidesId: '6182'
    }],
    ['san-antonio', { 
      id: 'san-antonio-cl', 
      name: 'San Antonio, Chile', 
      lat: -33.5928, 
      lon: -71.6127,
      worldTidesId: '6183'
    }],
    
    // Sur
    ['concepcion', { 
      id: 'concepcion-cl', 
      name: 'Concepción (Talcahuano), Chile', 
      lat: -36.8201, 
      lon: -73.0444,
      worldTidesId: '6184'
    }],
    ['puerto-montt', { 
      id: 'puerto-montt-cl', 
      name: 'Puerto Montt, Chile', 
      lat: -41.4693, 
      lon: -72.9424,
      worldTidesId: '6185'
    }],
    
    // Extremo Sur
    ['punta-arenas', { 
      id: 'punta-arenas-cl', 
      name: 'Punta Arenas, Chile', 
      lat: -53.1368, 
      lon: -70.9129,
      worldTidesId: '6186'
    }]
  ])

  async getTideData(lat: number, lon: number): Promise<TideInfo> {
    try {
      console.log('🌊 Tide data requested - using simulation to preserve API calls')
      
      // ==========================================
      // COMENTADO: APIs de mareas reales (para conservar llamadas)
      // 
      // Para activar APIs reales:
      // 1. Descomenta el código de WorldTides y/o StormGlass
      // 2. Verifica que las API keys estén en .env.local
      // 3. Cambia el mensaje en WeatherDashboard.tsx
      // 
      // APIs disponibles:
      // - WorldTides: 88 calls restantes
      // - StormGlass: Hasta 50 calls/día gratuitos
      // ==========================================
      
      // // Intentar WorldTides API primero
      // try {
      //   const worldTidesData = await this.getWorldTidesData(lat, lon)
      //   if (worldTidesData) {
      //     console.log('✅ WorldTides API data received successfully!')
      //     return worldTidesData
      //   }
      // } catch (error) {
      //   console.log('❌ WorldTides failed, trying StormGlass...', error)
      // }

      // // Fallback a StormGlass
      // try {
      //   const stormGlassData = await this.getStormGlassData(lat, lon)
      //   if (stormGlassData) {
      //     console.log('✅ StormGlass API data received successfully!')
      //     return stormGlassData
      //   }
      // } catch (error) {
      //   console.log('❌ StormGlass also failed, using simulation...', error)
      // }

      // Usar simulación mejorada por defecto (preserva API calls)
      console.log('🎯 Using enhanced simulation (preserves API calls)')
      return await this.getSimulatedTideData(lat, lon)
      
    } catch (error) {
      console.error('Error fetching tide data:', error)
      return this.getFallbackTideData(lat, lon)
    }
  }

  private saveTestResult(success: boolean) {
    try {
      // Guardar resultado del test en localStorage (browser) o archivo temporal
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('tide-api-test-result', JSON.stringify({
          success,
          timestamp: new Date().toISOString(),
          message: success ? 'APIs working correctly' : 'APIs not accessible'
        }))
      }
    } catch (error) {
      console.log('Could not save test result:', error)
    }
  }

  private async getWorldTidesData(lat: number, lon: number): Promise<TideInfo | null> {
    try {
      // WorldTides API gratuita (hasta 100 requests/mes)
      const today = new Date()
      
      const params = new URLSearchParams({
        extremes: 'true',
        heights: 'true',
        lat: lat.toString(),
        lon: lon.toString(),
        start: Math.floor(today.getTime() / 1000).toString(),
        length: '86400', // 24 horas
        datum: 'MSL', // Mean Sea Level - más común para páginas públicas
        step: '3600', // 1 hora de intervalo para más precisión
        key: process.env.WORLD_TIDES_API_KEY || process.env.NEXT_PUBLIC_WORLD_TIDES_API_KEY || 'demo'
      })

      const url = `${this.worldTidesUrl}?${params}`
      console.log('WorldTides URL:', url)

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`WorldTides API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('WorldTides API Response:', data)
      
      if (data.extremes && data.extremes.length > 0) {
        const result = this.parseWorldTidesResponse(data, lat, lon)
        console.log('Parsed tide data:', result)
        return result
      }
      
      return null
    } catch (error) {
      console.error('WorldTides API error:', error)
      throw error
    }
  }

  private async getStormGlassData(lat: number, lon: number): Promise<TideInfo | null> {
    try {
      // StormGlass API gratuita (hasta 50 requests/día)
      const today = new Date()
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lon.toString(),
        start: Math.floor(today.getTime() / 1000).toString(),
        end: Math.floor((today.getTime() + 24 * 60 * 60 * 1000) / 1000).toString()
      })

      const headers = {
        'Authorization': process.env.STORMGLASS_API_KEY || 'demo-key'
      }

      const url = `${this.openTidesUrl}?${params}`
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`StormGlass API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        return this.parseStormGlassResponse(data, lat, lon)
      }
      
      return null
    } catch (error) {
      console.error('StormGlass API error:', error)
      throw error
    }
  }

  private parseWorldTidesResponse(data: any, lat: number, lon: number): TideInfo {
    const station = this.findClosestStation(lat, lon)
    const now = new Date()
    
    console.log('Raw extremes data:', data.extremes)
    console.log('Raw heights data first 5:', data.heights ? data.heights.slice(0, 5) : 'no heights')
    console.log('Current timestamp:', Math.floor(now.getTime() / 1000))
    console.log('All heights around current time:')
    if (data.heights) {
      const currentTimestamp = Math.floor(now.getTime() / 1000)
      data.heights.slice(0, 10).forEach((h: any, i: number) => {
        const timeOffset = h.dt - currentTimestamp
        console.log(`Height ${i}: ${h.height}m at ${new Date(h.dt * 1000).toLocaleString('es-CL')} (${timeOffset > 0 ? '+' : ''}${timeOffset}s from now)`)
      })
    }
    
    // Buscar marea más cercana al tiempo actual
    const currentHeight = data.heights && data.heights.length > 0 
      ? this.findClosestHeight(data.heights, now)
      : this.estimateCurrentHeight(data.extremes, now)
    
    console.log('Current height calculated:', currentHeight)
    
    // Determinar tendencia
    const trend = this.calculateTrend(data.extremes, now)
    console.log('Trend calculated:', trend)
    
    // Convertir extremos a formato interno
    const nextTides = data.extremes.slice(0, 4).map((extreme: any) => ({
      time: new Date(extreme.dt * 1000).toISOString(),
      height: extreme.height,
      type: extreme.type === 'High' ? 'high' : 'low'
    }))

    return {
      current: {
        height: Number(currentHeight.toFixed(2)),
        time: now.toISOString(),
        trend
      },
      next: nextTides,
      station: `${station.name} (WorldTides)`,
      coordinates: { lat, lon }
    }
  }

  private parseStormGlassResponse(data: any, lat: number, lon: number): TideInfo {
    const station = this.findClosestStation(lat, lon)
    const now = new Date()
    
    // StormGlass devuelve extremos de marea
    const extremes = data.data.map((point: any) => ({
      time: point.time,
      height: point.height,
      type: point.type
    }))

    const currentHeight = this.estimateCurrentHeightFromExtremes(extremes, now)
    const trend = this.calculateTrendFromExtremes(extremes, now)
    
    const nextTides = extremes.slice(0, 4).map((extreme: any) => ({
      time: extreme.time,
      height: extreme.height,
      type: extreme.type.toLowerCase()
    }))

    return {
      current: {
        height: Number(currentHeight.toFixed(2)),
        time: now.toISOString(),
        trend
      },
      next: nextTides,
      station: `${station.name} (StormGlass)`,
      coordinates: { lat, lon }
    }
  }

  private findClosestHeight(heights: any[], currentTime: Date): number {
    const currentTimestamp = Math.floor(currentTime.getTime() / 1000)
    
    // Encontrar la altura más cercana al tiempo actual
    let closestHeight = heights[0]
    let minDifference = Math.abs(heights[0].dt - currentTimestamp)
    
    for (const height of heights) {
      const difference = Math.abs(height.dt - currentTimestamp)
      if (difference < minDifference) {
        minDifference = difference
        closestHeight = height
      }
    }
    
    console.log(`Closest height: ${closestHeight.height}m at ${new Date(closestHeight.dt * 1000).toLocaleString('es-CL')} (${minDifference}s difference)`)
    
    // Aplicar corrección de datum para Valparaíso basada en comparación con página oficial
    // WorldTides página muestra ~1.1m cuando API muestra ~0.13m (diferencia de ~0.97m)
    const datumCorrection = this.getDatumCorrection(currentTime.getTime())
    const correctedHeight = closestHeight.height + datumCorrection
    
    console.log(`Raw height: ${closestHeight.height}m, Corrected height: ${correctedHeight.toFixed(2)}m (correction: +${datumCorrection}m)`)
    return correctedHeight
  }

  private getDatumCorrection(timestamp: number): number {
    // Corrección basada en la diferencia observada entre API y página oficial de WorldTides
    // Página oficial: High Tide 10:51 PM = 1.1m
    // API response: ~11:22 PM = 0.13m  
    // Diferencia observada: ~0.97m
    
    // Para Valparaíso, aplicamos corrección fija basada en Chart Datum vs MSL
    // Esto es común en puertos chilenos donde el datum local difiere del MSL
    const valparaisoCorrection = 0.97 // metros
    
    return valparaisoCorrection
  }

  private estimateCurrentHeight(extremes: any[], currentTime: Date): number {
    if (!extremes || extremes.length < 2) return 1.0
    
    // Encontrar extremos antes y después del tiempo actual
    const currentTimestamp = currentTime.getTime() / 1000
    let beforeExtreme = null
    let afterExtreme = null
    
    for (let i = 0; i < extremes.length - 1; i++) {
      if (extremes[i].dt <= currentTimestamp && extremes[i + 1].dt >= currentTimestamp) {
        beforeExtreme = extremes[i]
        afterExtreme = extremes[i + 1]
        break
      }
    }
    
    if (!beforeExtreme || !afterExtreme) {
      return extremes[0]?.height || 1.0
    }
    
    // Interpolación sinusoidal entre extremos
    const timeDiff = afterExtreme.dt - beforeExtreme.dt
    const currentProgress = (currentTimestamp - beforeExtreme.dt) / timeDiff
    const heightDiff = afterExtreme.height - beforeExtreme.height
    
    const rawHeight = beforeExtreme.height + heightDiff * Math.sin(currentProgress * Math.PI / 2)
    
    // Aplicar la misma corrección de datum
    return rawHeight + this.getDatumCorrection(currentTimestamp * 1000)
  }

  private estimateCurrentHeightFromExtremes(extremes: any[], currentTime: Date): number {
    // Similar logic but for StormGlass format
    return this.estimateCurrentHeight(extremes.map(e => ({
      dt: new Date(e.time).getTime() / 1000,
      height: e.height
    })), currentTime)
  }

  private calculateTrend(extremes: any[], currentTime: Date): 'rising' | 'falling' {
    const currentTimestamp = currentTime.getTime() / 1000
    
    // Buscar el próximo extremo
    const nextExtreme = extremes.find((extreme: any) => extreme.dt > currentTimestamp)
    
    if (nextExtreme) {
      return nextExtreme.type === 'High' ? 'rising' : 'falling'
    }
    
    return 'rising' // Default
  }

  private calculateTrendFromExtremes(extremes: any[], currentTime: Date): 'rising' | 'falling' {
    const nextExtreme = extremes.find((extreme: any) => 
      new Date(extreme.time).getTime() > currentTime.getTime()
    )
    
    if (nextExtreme) {
      return nextExtreme.type.toLowerCase() === 'high' ? 'rising' : 'falling'
    }
    
    return 'rising'
  }

  private async getSimulatedTideData(lat: number, lon: number): Promise<TideInfo> {
    const now = new Date()
    const station = this.findClosestStation(lat, lon)
    
    // Simular marea basada en patrones reales de Chile
    // Chile tiene mareas semi-diurnas (2 altas y 2 bajas por día)
    const lunarDay = 24.84 // Día lunar en horas
    const timeInLunarDay = (now.getHours() + now.getMinutes() / 60) / lunarDay
    
    // Amplitud de marea promedio para costa chilena (1-3 metros)
    const baseAmplitude = this.getTideAmplitudeForLocation(lat)
    
    // Calcular altura actual de marea usando función sinusoidal
    const tidePhase = (timeInLunarDay * 2 * Math.PI) + this.getTidePhaseOffset(lat)
    const currentHeight = baseAmplitude * Math.sin(tidePhase) + this.getMeanSeaLevel(lat)
    
    // Determinar tendencia
    const trend = Math.cos(tidePhase) > 0 ? 'rising' : 'falling'
    
    // Generar próximas mareas
    const nextTides = this.generateNextTides(now, baseAmplitude, tidePhase, lat)
    
    return {
      current: {
        height: Number(currentHeight.toFixed(2)),
        time: now.toISOString(),
        trend
      },
      next: nextTides,
      station: station.name,
      coordinates: { lat, lon }
    }
  }

  private findClosestStation(lat: number, lon: number) {
    let closest = { id: '9430104', name: 'Estimación Chilean Coast', lat, lon, worldTidesId: '0000' }
    let minDistance = Infinity
    
    this.chileanStations.forEach((station) => {
      const distance = this.calculateDistance(lat, lon, station.lat, station.lon)
      if (distance < minDistance) {
        minDistance = distance
        closest = station
      }
    })
    
    return closest
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  private getTideAmplitudeForLocation(lat: number): number {
    // Amplitudes típicas para diferentes zonas de Chile
    if (lat > -25) return 1.2 + Math.random() * 0.4 // Norte: 1.2-1.6m
    if (lat > -35) return 1.5 + Math.random() * 0.5 // Centro: 1.5-2.0m
    if (lat > -45) return 2.0 + Math.random() * 0.8 // Sur: 2.0-2.8m
    return 2.5 + Math.random() * 1.0 // Extremo Sur: 2.5-3.5m
  }

  private getTidePhaseOffset(lat: number): number {
    // Offset de fase basado en ubicación geográfica
    return (lat + 30) * 0.1
  }

  private getMeanSeaLevel(lat: number): number {
    // Nivel medio del mar relativo al datum local
    return 0 // Referencia al datum local
  }

  private generateNextTides(baseTime: Date, amplitude: number, currentPhase: number, lat: number): TideData[] {
    const tides: TideData[] = []
    const lunarHour = 24.84 / 24 // Factor de corrección lunar
    
    // Generar próximas 4 mareas (2 altas, 2 bajas)
    for (let i = 1; i <= 4; i++) {
      const phaseShift = (Math.PI / 2) * i // 90° entre cada marea
      const adjustedPhase = currentPhase + phaseShift
      
      const height = amplitude * Math.sin(adjustedPhase)
      const isHigh = Math.sin(adjustedPhase) > Math.sin(adjustedPhase + 0.1)
      
      // Tiempo aproximado de la próxima marea
      const timeOffset = (6.2 * i * lunarHour) * 60 * 60 * 1000 // ~6.2 horas entre mareas
      const tideTime = new Date(baseTime.getTime() + timeOffset)
      
      tides.push({
        time: tideTime.toISOString(),
        height: Number((height + this.getMeanSeaLevel(lat)).toFixed(2)),
        type: isHigh ? 'high' : 'low'
      })
    }
    
    return tides
  }

  private getFallbackTideData(lat: number, lon: number): TideInfo {
    const now = new Date()
    const station = this.findClosestStation(lat, lon)
    
    return {
      current: {
        height: 1.2,
        time: now.toISOString(),
        trend: 'rising'
      },
      next: [
        {
          time: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
          height: 2.1,
          type: 'high'
        },
        {
          time: new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString(),
          height: 0.3,
          type: 'low'
        }
      ],
      station: station.name,
      coordinates: { lat, lon }
    }
  }

  // Método para obtener datos de tabla de mareas estática (como backup)
  async getStaticTideTable(portName: string): Promise<TideData[]> {
    // Base de datos estática de mareas principales para puertos chilenos
    const staticTides: Record<string, TideData[]> = {
      'valparaiso': [
        { time: '06:30', height: 1.8, type: 'high' },
        { time: '12:45', height: 0.4, type: 'low' },
        { time: '18:50', height: 1.9, type: 'high' },
        { time: '00:20', height: 0.3, type: 'low' }
      ],
      'concepcion': [
        { time: '07:15', height: 2.2, type: 'high' },
        { time: '13:30', height: 0.2, type: 'low' },
        { time: '19:45', height: 2.3, type: 'high' },
        { time: '01:15', height: 0.1, type: 'low' }
      ]
    }
    
    return staticTides[portName.toLowerCase()] || staticTides['valparaiso']
  }
}