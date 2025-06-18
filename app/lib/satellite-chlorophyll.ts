interface SatelliteChlorophyllData {
  chlorophyll_a: number // mg/m³
  quality_level: number // 0-4 (0=best, 4=poor)
  pixel_count: number // Number of valid pixels in area
  coordinates: {
    lat: number
    lon: number
  }
  timestamp: string
  satellite: string // 'MODIS-Aqua' | 'VIIRS' | 'MODIS-Terra'
  source: string
}

export class SatelliteChlorophyllService {
  private polarWatchBaseUrl = 'https://polarwatch.noaa.gov/erddap/griddap'
  private nasaOceanColorUrl = 'https://oceandata.sci.gsfc.nasa.gov/api'
  private apiMonitor: any
  private isClient = false

  constructor() {
    this.isClient = typeof window !== 'undefined'
    
    // Cargar el monitor de APIs dinámicamente
    if (this.isClient) {
      import('./api-monitor').then(({ default: APICallMonitor }) => {
        this.apiMonitor = APICallMonitor.getInstance()
      }).catch(() => {
        this.apiMonitor = null
      })
    }
  }

  async getChlorophyllFromSatellite(lat: number, lon: number): Promise<SatelliteChlorophyllData | null> {
    try {
      console.log('Fetching REAL satellite chlorophyll imagery...')
      
      // Try multiple satellite sources in order of preference
      const sources = [
        { id: 'chl-aqua-daily', name: 'MODIS-Aqua', priority: 1 },
        { id: 'chl-viirs-daily', name: 'VIIRS', priority: 2 },
      ]

      for (const source of sources) {
        try {
          const data = await this.fetchFromPolarWatch(lat, lon, source.id, source.name)
          if (data) {
            console.log(`Satellite chlorophyll data obtained from ${source.name}:`, data.chlorophyll_a, 'mg/m³')
            return data
          }
        } catch (error) {
          console.log(`${source.name} data not available, trying next source...`)
        }
      }

      throw new Error('No satellite chlorophyll data available from any source')

    } catch (error) {
      console.error('Satellite chlorophyll fetch failed:', error)
      throw error
    }
  }

  private async fetchFromPolarWatch(lat: number, lon: number, datasetId: string, satelliteName: string): Promise<SatelliteChlorophyllData | null> {
    try {
      // Verificar límites de API
      if (this.apiMonitor) {
        const canCall = this.apiMonitor.canMakeCall('satellite')
        if (!canCall.allowed) {
          console.warn(`🚫 Satellite API limit reached: ${canCall.reason}`)
          throw new Error(`API limit reached: ${canCall.reason}`)
        }
      }

      // Use our Next.js API proxy to avoid CORS issues
      const sourceMap = {
        'chl-aqua-daily': 'modis-aqua',
        'chl-viirs-daily': 'viirs'
      }
      
      const source = sourceMap[datasetId as keyof typeof sourceMap] || 'modis-aqua'
      const response = await fetch(`/api/satellite-chlorophyll?lat=${lat}&lon=${lon}&source=${source}`)
      
      // Registrar la llamada en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('satellite', `chlorophyll_${source}`, response.ok)
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        console.log(`Satellite proxy error: ${response.status} - ${errorData.error}`)
        throw new Error(`Satellite proxy error: ${response.status}`)
      }

      const data = await response.json()
      
      console.log(`Satellite data received via proxy from ${satelliteName}:`, data)

      return {
        chlorophyll_a: data.chlorophyll_a,
        quality_level: data.quality_level,
        pixel_count: data.pixel_count,
        coordinates: { lat, lon },
        timestamp: data.timestamp,
        satellite: data.satellite,
        source: 'Satellite-Proxy'
      }
      
    } catch (error) {
      console.error(`Satellite ${satelliteName} fetch failed:`, error)
      
      // Registrar el error en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('satellite', `chlorophyll_${satelliteName}`, false)
      }
      
      throw error
    }
  }

  async getChlorophyllImagery(lat: number, lon: number, radiusKm: number = 50): Promise<{
    imageUrl: string,
    dataUrl: string,
    bounds: { north: number, south: number, east: number, west: number },
    composite8Day?: string
  } | null> {
    try {
      // Calculate bounding box for image request
      const kmPerDegree = 111.32 // Approximate km per degree
      const deltaLat = radiusKm / kmPerDegree
      const deltaLon = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180))

      const bounds = {
        north: lat + deltaLat,
        south: lat - deltaLat,
        east: lon + deltaLon,
        west: lon - deltaLon
      }

      // Get the most recent available date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]

      // Calculate 8-day composite period (more realistic)
      const eightDaysAgo = new Date()
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)
      const startDate = eightDaysAgo.toISOString().split('T')[0]

      // NASA Ocean Color 8-day composite (more realistic for fishermen)
      const composite8DayUrl = `https://oceandata.sci.gsfc.nasa.gov/cgi-bin/getfile.pl?` +
        `product=MODIS-Aqua_Chlorophyll_8Day_Composite&` +
        `north=${bounds.north.toFixed(4)}&south=${bounds.south.toFixed(4)}&` +
        `west=${bounds.west.toFixed(4)}&east=${bounds.east.toFixed(4)}&` +
        `format=png&resolution=4km`

      // PolarWatch daily image (fallback)
      const imageUrl = `https://polarwatch.noaa.gov/erddap/griddap/erdMH1chlamday.png?` +
        `chlor_a[(${dateStr}T00:00:00Z)]` +
        `[(${bounds.south.toFixed(4)}):1:(${bounds.north.toFixed(4)})]` +
        `[(${bounds.west.toFixed(4)}):1:(${bounds.east.toFixed(4)})]` +
        `&.draw=surface&.vars=longitude|latitude|chlor_a&.colorBar=|||||`

      // 8-day composite data URL for better cloud-free coverage
      const composite8DayDataUrl = `https://coastwatch.pfeg.noaa.gov/erddap/griddap/erdMH1chla8day.csv?` +
        `chlor_a[(${startDate}T00:00:00Z):1:(${dateStr}T00:00:00Z)]` +
        `[(${bounds.south.toFixed(4)}):1:(${bounds.north.toFixed(4)})]` +
        `[(${bounds.west.toFixed(4)}):1:(${bounds.east.toFixed(4)})]`

      const dataUrl = `https://polarwatch.noaa.gov/erddap/griddap/erdMH1chlamday.csv?` +
        `chlor_a[(${dateStr}T00:00:00Z)]` +
        `[(${bounds.south.toFixed(4)}):1:(${bounds.north.toFixed(4)})]` +
        `[(${bounds.west.toFixed(4)}):1:(${bounds.east.toFixed(4)})]`

      return {
        imageUrl,
        dataUrl,
        bounds,
        composite8Day: composite8DayDataUrl
      }

    } catch (error) {
      console.error('Failed to generate chlorophyll imagery URLs:', error)
      return null
    }
  }

  // Get historical data for trend analysis (limited to realistic timeframes)
  async getChlorophyllTimeSeries(lat: number, lon: number, days: number = 14): Promise<Array<{
    date: string,
    chlorophyll_a: number,
    satellite: string
  }> | null> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
      
      const startStr = startDate.toISOString().split('T')[0]
      const endStr = endDate.toISOString().split('T')[0]

      const latMin = (lat - 0.02).toFixed(4)
      const latMax = (lat + 0.02).toFixed(4)
      const lonMin = (lon - 0.02).toFixed(4)
      const lonMax = (lon + 0.02).toFixed(4)

      const url = `${this.polarWatchBaseUrl}/erdMH1chlamday.csv?` +
        `chlor_a[(${startStr}T00:00:00Z):1:(${endStr}T23:59:59Z)]` +
        `[(${latMin}):1:(${latMax})]` +
        `[(${lonMin}):1:(${lonMax})]`

      // Verificar límites de API para NOAA/PolarWatch
      if (this.apiMonitor) {
        const canCall = this.apiMonitor.canMakeCall('noaa')
        if (!canCall.allowed) {
          console.warn(`🚫 NOAA API limit reached: ${canCall.reason}`)
          throw new Error(`API limit reached: ${canCall.reason}`)
        }
      }

      const response = await fetch(url)
      
      // Registrar la llamada en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('noaa', 'chlorophyll_timeseries', response.ok)
      }
      
      if (!response.ok) {
        throw new Error(`Time series fetch error: ${response.status}`)
      }

      const csvText = await response.text()
      const lines = csvText.trim().split('\n')
      
      const timeSeries: Array<{date: string, chlorophyll_a: number, satellite: string}> = []
      
      for (let i = 2; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= 4) {
          const chlorValue = parseFloat(values[3])
          if (!isNaN(chlorValue) && chlorValue > 0) {
            timeSeries.push({
              date: values[0],
              chlorophyll_a: Number(chlorValue.toFixed(2)),
              satellite: 'MODIS-Aqua'
            })
          }
        }
      }

      return timeSeries.length > 0 ? timeSeries : null

    } catch (error) {
      console.error('Failed to fetch chlorophyll time series:', error)
      
      // Registrar el error en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('noaa', 'chlorophyll_timeseries', false)
      }
      
      return null
    }
  }
}