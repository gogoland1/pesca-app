interface NASAChlorophyllData {
  chlorophyll_a: number
  sea_surface_temperature: number
  coordinates: {
    lat: number
    lon: number
  }
  timestamp: string
}

import { SatelliteChlorophyllService } from './satellite-chlorophyll'

export class NASAEarthdataService {
  private username: string
  private password: string
  private baseUrl = 'https://oceandata.sci.gsfc.nasa.gov/api/file_search'
  private erddapBaseUrl = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap'
  private satelliteService: SatelliteChlorophyllService
  private apiMonitor: any
  private isClient = false

  constructor() {
    this.username = process.env.NASA_EARTHDATA_USERNAME || ''
    this.password = process.env.NASA_EARTHDATA_PASSWORD || ''
    this.satelliteService = new SatelliteChlorophyllService()
    if (!this.username || !this.password) {
      console.log('NASA Earthdata credentials not found - using satellite imagery for chlorophyll')
    }

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

  async getChlorophyllData(lat: number, lon: number, radiusKm: number = 10) {
    try {
      // Try satellite imagery data first (most accurate)
      console.log('Attempting to fetch REAL satellite chlorophyll imagery...')
      
      try {
        const satelliteData = await this.satelliteService.getChlorophyllFromSatellite(lat, lon)
        if (satelliteData) {
          console.log(`Satellite chlorophyll data received from ${satelliteData.satellite}:`, satelliteData.chlorophyll_a, 'mg/m³', `(Quality: ${satelliteData.quality_level}/4)`)
          
          // Convert satellite data to our expected format
          return {
            chlorophyll_a: satelliteData.chlorophyll_a,
            sea_surface_temperature: 15 + Math.sin((new Date().getMonth() - 1) * Math.PI / 6) * 3, // Approximate
            coordinates: satelliteData.coordinates,
            timestamp: satelliteData.timestamp
          }
        }
      } catch (satelliteError) {
        console.log('Satellite data not available, trying ERDDAP...')
      }
      
      // Fallback to ERDDAP
      const realData = await this.getRealChlorophyllData(lat, lon)
      if (realData) {
        console.log('ERDDAP chlorophyll data received:', realData.chlorophyll_a, 'mg/m³')
        return realData
      }
      
      // Final fallback to enhanced simulation
      console.log('Falling back to enhanced chlorophyll simulation')
      return await this.getMockChlorophyllData(lat, lon)
      
    } catch (error) {
      console.error('Error fetching chlorophyll data:', error)
      console.log('Using enhanced simulation fallback')
      return await this.getMockChlorophyllData(lat, lon)
    }
  }

  private async getRealChlorophyllData(lat: number, lon: number): Promise<NASAChlorophyllData | null> {
    try {
      // Use NOAA CoastWatch ERDDAP for MODIS Aqua chlorophyll data
      // Dataset: erdMH1chlamday (MODIS Aqua Monthly)
      // Alternative: noaacwNPPVIIRSchlaDaily (VIIRS Daily)
      
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const timeStr = yesterday.toISOString().split('T')[0]
      
      // VIIRS daily dataset - better coverage for near real-time
      const datasetId = 'noaacwNPPVIIRSchlaDaily'
      
      // Create bounds around the point (small area for better chance of data)
      const latMin = (lat - 0.02).toFixed(4)
      const latMax = (lat + 0.02).toFixed(4)
      const lonMin = (lon - 0.02).toFixed(4)
      const lonMax = (lon + 0.02).toFixed(4)
      
      // ERDDAP griddap URL for chlorophyll data
      const url = `${this.erddapBaseUrl}/${datasetId}.csv?` +
        `chlor_a[(${timeStr}T00:00:00Z):1:(${timeStr}T23:59:59Z)]` +
        `[(${latMin}):1:(${latMax})]` +
        `[(${lonMin}):1:(${lonMax})]`
      
      console.log('ERDDAP URL:', url)
      
      // Verificar límites de API para NOAA/ERDDAP
      if (this.apiMonitor) {
        const canCall = this.apiMonitor.canMakeCall('noaa')
        if (!canCall.allowed) {
          console.warn(`🚫 NOAA ERDDAP API limit reached: ${canCall.reason}`)
          throw new Error(`API limit reached: ${canCall.reason}`)
        }
      }
      
      const response = await fetch(url)
      
      // Registrar la llamada en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('noaa', 'erddap_chlorophyll', response.ok)
      }
      
      if (!response.ok) {
        throw new Error(`ERDDAP error: ${response.status} - ${response.statusText}`)
      }
      
      const csvText = await response.text()
      console.log('ERDDAP response preview:', csvText.substring(0, 500))
      
      // Parse CSV response
      const lines = csvText.trim().split('\n')
      if (lines.length < 3) { // Header + units + at least one data row
        throw new Error('No chlorophyll data available for this location/time')
      }
      
      // Skip header (line 0) and units (line 1), get first data row
      const dataLine = lines[2]
      const values = dataLine.split(',')
      
      if (values.length < 4) {
        throw new Error('Invalid CSV format from ERDDAP')
      }
      
      // CSV format: time,latitude,longitude,chlor_a
      const chlorophyll = parseFloat(values[3])
      
      if (isNaN(chlorophyll) || chlorophyll <= 0) {
        throw new Error('Invalid chlorophyll value received')
      }
      
      // Calculate approximate SST for Chilean waters
      const month = today.getMonth()
      const sst = 15 + Math.sin((month - 1) * Math.PI / 6) * 3 + (Math.random() - 0.5)
      
      return {
        chlorophyll_a: Number(chlorophyll.toFixed(2)),
        sea_surface_temperature: Number(sst.toFixed(1)),
        coordinates: { lat, lon },
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('ERDDAP fetch failed:', error)
      
      // Registrar el error en el monitor
      if (this.apiMonitor) {
        this.apiMonitor.recordCall('noaa', 'erddap_chlorophyll', false)
      }
      
      throw error
    }
  }

  private async getMockChlorophyllData(lat: number, lon: number): Promise<NASAChlorophyllData | null> {
    // Simulate realistic chlorophyll-a values for Chilean coast
    // Chilean upwelling zones typically have high chlorophyll (5-50 mg/m³)
    // Open ocean areas have lower values (0.1-5 mg/m³)
    
    const distanceFromCoast = Math.abs(lon + 71) * 111; // Rough distance in km
    const baseChlorophyll = distanceFromCoast < 50 ? 
      Math.random() * 20 + 10 : // Coastal: 10-30 mg/m³
      Math.random() * 3 + 0.5;  // Offshore: 0.5-3.5 mg/m³
    
    // Add seasonal variation (summer = lower, winter = higher)
    const month = new Date().getMonth()
    const seasonalFactor = month >= 5 && month <= 8 ? 0.7 : 1.3 // Winter/Summer
    
    const chlorophyll = Number((baseChlorophyll * seasonalFactor).toFixed(1))
    
    // Sea Surface Temperature for Chilean coast (typical range)
    const sst = 12 + Math.random() * 10 + Math.sin((month - 1) * Math.PI / 6) * 4
    
    return {
      chlorophyll_a: chlorophyll,
      sea_surface_temperature: Number(sst.toFixed(1)),
      coordinates: { lat, lon },
      timestamp: new Date().toISOString()
    }
  }

  async getProductivityZones(lat: number, lon: number, radiusKm: number = 20) {
    try {
      const zones = []
      const gridSize = 0.1 // ~11km resolution
      
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          const zoneLat = lat + (i * gridSize)
          const zoneLon = lon + (j * gridSize)
          
          const data = await this.getMockChlorophyllData(zoneLat, zoneLon)
          if (data) {
            zones.push({
              lat: zoneLat,
              lon: zoneLon,
              chlorophyll: data.chlorophyll_a,
              productivity: this.calculateProductivity(data.chlorophyll_a),
              distance: this.calculateDistance(lat, lon, zoneLat, zoneLon)
            })
          }
        }
      }
      
      return zones.filter(zone => zone.distance <= radiusKm)
        .sort((a, b) => b.productivity - a.productivity)
      
    } catch (error) {
      console.error('Error calculating productivity zones:', error)
      return []
    }
  }

  private calculateProductivity(chlorophyll: number): number {
    // Simple productivity index based on chlorophyll levels
    if (chlorophyll > 15) return 0.9      // Muy alta
    if (chlorophyll > 8) return 0.7       // Alta
    if (chlorophyll > 3) return 0.5       // Media
    if (chlorophyll > 1) return 0.3       // Baja
    return 0.1                            // Muy baja
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
}