#!/usr/bin/env node

/**
 * Script de validación de APIs para Pesca App
 * Ejecutar con: node scripts/validate-apis.js
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function validateOpenWeatherMap() {
  log(colors.blue, '\n🌤️  Validando OpenWeatherMap API...');
  
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!apiKey || apiKey === 'your_openweathermap_api_key_here') {
    log(colors.red, '❌ API key de OpenWeatherMap no configurada');
    log(colors.yellow, '   Configura NEXT_PUBLIC_OPENWEATHER_API_KEY en .env.local');
    return false;
  }
  
  try {
    // Test coordinates: Valparaíso, Chile
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=-33.0472&lon=-71.6127&appid=${apiKey}&units=metric`;
    const response = await makeRequest(url);
    
    if (response.status === 200) {
      log(colors.green, '✅ OpenWeatherMap API funcionando correctamente');
      log(colors.cyan, `   Ubicación: ${response.data.name}, ${response.data.sys.country}`);
      log(colors.cyan, `   Temperatura: ${response.data.main.temp}°C`);
      log(colors.cyan, `   Viento: ${response.data.wind.speed} m/s`);
      if (response.data.wind.gust) {
        log(colors.cyan, `   Rachas: ${response.data.wind.gust} m/s`);
      }
      return true;
    } else if (response.status === 401) {
      log(colors.red, '❌ API key de OpenWeatherMap inválida');
      log(colors.yellow, '   Verifica tu API key en https://openweathermap.org/api_keys');
      return false;
    } else {
      log(colors.red, `❌ Error en OpenWeatherMap: ${response.status}`);
      log(colors.yellow, `   Respuesta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `❌ Error conectando con OpenWeatherMap: ${error.message}`);
    return false;
  }
}

async function validateNASAEarthdata() {
  log(colors.blue, '\n🛰️  Validando NASA Earthdata...');
  
  const username = process.env.NASA_EARTHDATA_USERNAME;
  const password = process.env.NASA_EARTHDATA_PASSWORD;
  
  if (!username || username === 'your_nasa_username_here' || 
      !password || password === 'your_nasa_password_here') {
    log(colors.red, '❌ Credenciales de NASA Earthdata no configuradas');
    log(colors.yellow, '   Configura NASA_EARTHDATA_USERNAME y NASA_EARTHDATA_PASSWORD en .env.local');
    log(colors.yellow, '   Regístrate en: https://urs.earthdata.nasa.gov/');
    return false;
  }
  
  try {
    // Test NASA URS authentication
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const url = 'https://urs.earthdata.nasa.gov/api/users/user';
    
    const response = await makeRequest(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'PescaApp/1.0'
      }
    });
    
    if (response.status === 200) {
      log(colors.green, '✅ NASA Earthdata credenciales válidas');
      if (response.data.user) {
        log(colors.cyan, `   Usuario: ${response.data.user.username}`);
        log(colors.cyan, `   Email: ${response.data.user.email}`);
      }
      return true;
    } else if (response.status === 401) {
      log(colors.red, '❌ Credenciales de NASA Earthdata inválidas');
      log(colors.yellow, '   Verifica tu username y password');
      return false;
    } else {
      log(colors.red, `❌ Error en NASA Earthdata: ${response.status}`);
      return false;
    }
  } catch (error) {
    log(colors.red, `❌ Error conectando con NASA Earthdata: ${error.message}`);
    log(colors.yellow, '   Nota: Los datos de clorofila funcionarán con datos simulados');
    return false;
  }
}

async function validateCopernicusMarine() {
  log(colors.blue, '\n🌊 Validando Copernicus Marine...');
  
  const username = process.env.COPERNICUS_MARINE_USERNAME;
  const password = process.env.COPERNICUS_MARINE_PASSWORD;
  
  if (!username || username === 'your_copernicus_username_here' || 
      !password || password === 'your_copernicus_password_here') {
    log(colors.yellow, '⚠️  Credenciales de Copernicus Marine no configuradas');
    log(colors.yellow, '   Usando datos simulados avanzados para océano');
    log(colors.yellow, '   Para datos reales: regístrate en https://marine.copernicus.eu/');
    return false;
  }
  
  try {
    // Note: Copernicus Marine uses complex authentication
    // For now, just validate credentials format
    log(colors.green, '✅ Credenciales de Copernicus Marine configuradas');
    log(colors.cyan, `   Usuario: ${username}`);
    log(colors.yellow, '   Nota: Validación completa requiere API específica');
    return true;
  } catch (error) {
    log(colors.red, `❌ Error en Copernicus Marine: ${error.message}`);
    log(colors.yellow, '   Nota: Datos oceanográficos funcionarán con simulación avanzada');
    return false;
  }
}

function validateEnvironment() {
  log(colors.blue, '\n⚙️  Validando configuración del entorno...');
  
  const requiredVars = [
    'NEXT_PUBLIC_DEFAULT_LAT',
    'NEXT_PUBLIC_DEFAULT_LON',
    'NEXT_PUBLIC_MAX_DISTANCE_KM'
  ];
  
  let valid = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      log(colors.red, `❌ Variable ${varName} no configurada`);
      valid = false;
    } else {
      log(colors.green, `✅ ${varName}: ${value}`);
    }
  });
  
  // Validate coordinates are in Chilean waters
  const lat = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT);
  const lon = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LON);
  
  if (lat < -56 || lat > -17.5 || lon < -75 || lon > -66) {
    log(colors.yellow, '⚠️  Las coordenadas por defecto están fuera de aguas chilenas');
    log(colors.yellow, '   Considera ajustar NEXT_PUBLIC_DEFAULT_LAT y NEXT_PUBLIC_DEFAULT_LON');
  } else {
    log(colors.green, '✅ Coordenadas dentro del rango de aguas chilenas');
  }
  
  return valid;
}

async function main() {
  log(colors.cyan, '🎣 Validador de APIs - Pesca App');
  log(colors.cyan, '=====================================');
  
  // Check if .env.local exists
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log(colors.red, '❌ Archivo .env.local no encontrado');
    log(colors.yellow, '   Copia .env.example a .env.local y configura tus API keys');
    process.exit(1);
  }
  
  log(colors.green, '✅ Archivo .env.local encontrado');
  
  const results = await Promise.all([
    validateEnvironment(),
    validateOpenWeatherMap(),
    validateNASAEarthdata(),
    validateCopernicusMarine()
  ]);
  
  const allValid = results.every(Boolean);
  
  log(colors.blue, '\n📊 Resumen de Validación:');
  log(colors.blue, '========================');
  
  if (allValid) {
    log(colors.green, '🎉 ¡Todas las APIs están configuradas correctamente!');
    log(colors.cyan, '   La aplicación debería funcionar con datos en tiempo real.');
    log(colors.cyan, '   Ejecuta: npm run dev');
  } else {
    log(colors.yellow, '⚠️  Algunas APIs no están configuradas correctamente.');
    log(colors.yellow, '   La aplicación funcionará con datos simulados.');
    log(colors.yellow, '   Consulta API_SETUP.md para instrucciones detalladas.');
  }
  
  log(colors.cyan, '\n📚 Recursos útiles:');
  log(colors.cyan, '   • Guía de APIs: ./API_SETUP.md');
  log(colors.cyan, '   • OpenWeatherMap: https://openweathermap.org/api');
  log(colors.cyan, '   • NASA Earthdata: https://urs.earthdata.nasa.gov/');
  
  process.exit(allValid ? 0 : 1);
}

// Run validation
main().catch(error => {
  log(colors.red, `💥 Error inesperado: ${error.message}`);
  process.exit(1);
});