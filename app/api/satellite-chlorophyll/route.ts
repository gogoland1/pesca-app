import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const source = searchParams.get('source') || 'modis-aqua'

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 })
  }

  try {
    console.log(`Fetching satellite chlorophyll for ${lat}, ${lon} from ${source}`)
    
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    
    // Create a small bounding box around the point
    const latMin = (latNum - 0.05).toFixed(4)
    const latMax = (latNum + 0.05).toFixed(4)
    const lonMin = (lonNum - 0.05).toFixed(4)
    const lonMax = (lonNum + 0.05).toFixed(4)

    // Get recent date (yesterday to ensure data availability)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const timeStr = yesterday.toISOString().split('T')[0]

    // Dataset mapping
    const datasetMap = {
      'modis-aqua': 'erdMH1chlamday', // MODIS Aqua monthly
      'viirs': 'noaacwNPPVIIRSchlaDaily' // VIIRS daily
    }

    const datasetId = datasetMap[source as keyof typeof datasetMap] || 'erdMH1chlamday'
    
    // Build ERDDAP URL
    const erddapUrl = `https://coastwatch.pfeg.noaa.gov/erddap/griddap/${datasetId}.csv?` +
      `chlor_a[(${timeStr}T00:00:00Z):1:(${timeStr}T23:59:59Z)]` +
      `[(${latMin}):1:(${latMax})]` +
      `[(${lonMin}):1:(${lonMax})]`

    console.log(`Proxy fetching from: ${erddapUrl}`)

    const response = await fetch(erddapUrl)

    if (!response.ok) {
      console.log(`ℹ️  ERDDAP service unavailable (${response.status}), using simulation`)
      
      // If no satellite data available, generate realistic values for Chilean coast
      console.log('✅ Using enhanced satellite simulation for Chilean waters')
      
      const distanceFromCoast = Math.abs(lonNum + 71) * 111 // km from coast
      
      // Chilean upwelling zones have high chlorophyll
      let chlorophyll = distanceFromCoast < 50 ? 
        5 + Math.random() * 15 : // Coastal: 5-20 mg/m³
        1 + Math.random() * 4   // Offshore: 1-5 mg/m³
      
      // Winter months (Jun-Aug) have higher productivity
      const month = new Date().getMonth() + 1
      if (month >= 6 && month <= 8) {
        chlorophyll *= 1.3
      }
      
      return NextResponse.json({
        chlorophyll_a: Number(chlorophyll.toFixed(2)),
        quality_level: 3, // Simulated data
        pixel_count: 0,
        coordinates: { lat: latNum, lon: lonNum },
        timestamp: new Date().toISOString(),
        satellite: 'Enhanced-Simulation',
        source: 'satellite_fallback'
      })
    }

    const csvText = await response.text()
    console.log(`CSV response preview:`, csvText.substring(0, 300))

    // Parse CSV response
    const lines = csvText.trim().split('\n')
    if (lines.length < 3) {
      throw new Error('No satellite chlorophyll data available for this location/time')
    }

    // Process multiple pixels and calculate statistics
    const validValues: number[] = []
    let pixelCount = 0

    for (let i = 2; i < lines.length; i++) { // Skip header and units
      const values = lines[i].split(',')
      if (values.length >= 4) {
        const chlorValue = parseFloat(values[3])
        if (!isNaN(chlorValue) && chlorValue > 0 && chlorValue < 100) { // Reasonable range
          validValues.push(chlorValue)
          pixelCount++
        }
      }
    }

    if (validValues.length === 0) {
      throw new Error('No valid satellite chlorophyll values found')
    }

    // Calculate robust average (exclude extreme outliers)
    validValues.sort((a, b) => a - b)
    const q1 = validValues[Math.floor(validValues.length * 0.25)]
    const q3 = validValues[Math.floor(validValues.length * 0.75)]
    const iqr = q3 - q1
    const filteredValues = validValues.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr)
    
    const avgChlorophyll = filteredValues.reduce((sum, val) => sum + val, 0) / filteredValues.length

    // Assess quality based on pixel count and data consistency
    let quality = 0 // Start with best quality
    if (pixelCount < 5) quality += 1
    if (filteredValues.length < validValues.length * 0.8) quality += 1
    if (avgChlorophyll < 0.1 || avgChlorophyll > 50) quality += 1

    console.log(`Satellite data processed: ${avgChlorophyll.toFixed(2)} mg/m³ from ${pixelCount} pixels`)

    return NextResponse.json({
      chlorophyll_a: Number(avgChlorophyll.toFixed(2)),
      quality_level: Math.min(quality, 4),
      pixel_count: pixelCount,
      coordinates: { lat: latNum, lon: lonNum },
      timestamp: new Date().toISOString(),
      satellite: source === 'viirs' ? 'VIIRS' : 'MODIS-Aqua',
      source: 'satellite_proxy'
    })

  } catch (error) {
    console.error('Satellite proxy error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch satellite chlorophyll data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}