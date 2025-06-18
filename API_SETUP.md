# Configuración de APIs para Pesca App

Esta guía te ayudará a obtener y configurar todas las API keys necesarias para que la aplicación de pesca funcione con datos en tiempo real.

## 🌤️ 1. OpenWeatherMap API

### ¿Para qué se usa?
- Datos meteorológicos en tiempo real (viento, presión, temperatura, humedad)
- Datos de precipitación y nubosidad
- Rachas de viento

### Cómo obtener la API key:

1. **Registrarse en OpenWeatherMap**
   - Ve a: https://openweathermap.org/api
   - Haz clic en "Sign Up" y crea una cuenta gratuita
   - Confirma tu email

2. **Obtener la API key**
   - Una vez logueado, ve a: https://home.openweathermap.org/api_keys
   - Copia tu API key (se ve así: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

3. **Plan recomendado**
   - **Plan gratuito**: 1,000 llamadas/día (suficiente para desarrollo)
   - **Plan básico ($40/mes)**: 100,000 llamadas/día (recomendado para producción)

### Configuración:
```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=tu_api_key_aqui
```

---

## 🛰️ 2. NASA Earthdata

### ¿Para qué se usa?
- Datos de clorofila-a (productividad del océano)
- Temperatura superficial del mar
- Zonas de productividad marina

### Cómo obtener las credenciales:

1. **Crear cuenta en NASA Earthdata**
   - Ve a: https://urs.earthdata.nasa.gov/
   - Haz clic en "Register" y completa el formulario
   - **Importante**: En "Study Area", selecciona "Ocean/Marine Sciences"

2. **Activar acceso a datos oceanográficos**
   - Una vez registrado, ve a: https://oceancolor.gsfc.nasa.gov/registration/
   - Aprueba los términos de uso para datos MODIS/VIIRS

3. **Obtener credenciales**
   - Tu username es el que elegiste al registrarte
   - Tu password es el mismo de tu cuenta NASA Earthdata

### Configuración:
```env
NASA_EARTHDATA_USERNAME=tu_username_nasa
NASA_EARTHDATA_PASSWORD=tu_password_nasa
```

---

## 🗺️ 3. Configuración Regional (Opcional)

### Coordenadas por defecto para diferentes regiones de Chile:

```env
# Arica y Parinacota
NEXT_PUBLIC_DEFAULT_LAT=-18.4783
NEXT_PUBLIC_DEFAULT_LON=-70.3126

# Valparaíso (actual)
NEXT_PUBLIC_DEFAULT_LAT=-33.0472
NEXT_PUBLIC_DEFAULT_LON=-71.6127

# Concepción
NEXT_PUBLIC_DEFAULT_LAT=-36.8201
NEXT_PUBLIC_DEFAULT_LON=-73.0444

# Puerto Montt
NEXT_PUBLIC_DEFAULT_LAT=-41.4693
NEXT_PUBLIC_DEFAULT_LON=-72.9424

# Punta Arenas
NEXT_PUBLIC_DEFAULT_LAT=-53.1638
NEXT_PUBLIC_DEFAULT_LON=-70.9171
```

---

## 📋 Instrucciones de Configuración

### 1. Editar el archivo `.env.local`

```bash
# Abrir el archivo
nano .env.local
```

### 2. Reemplazar los valores de ejemplo:

```env
# OpenWeatherMap API Key
NEXT_PUBLIC_OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# NASA Earthdata API Credentials  
NASA_EARTHDATA_USERNAME=mi_usuario_nasa
NASA_EARTHDATA_PASSWORD=mi_password_nasa

# Coordenadas por defecto (Valparaíso)
NEXT_PUBLIC_DEFAULT_LAT=-33.0472
NEXT_PUBLIC_DEFAULT_LON=-71.6127

# Límite marino (20 millas náuticas)
NEXT_PUBLIC_MAX_DISTANCE_KM=37
```

### 3. Reiniciar la aplicación

```bash
npm run dev
```

---

## ✅ Verificación de Configuración

### 1. Comprobar OpenWeatherMap
- Al cargar la app, deberías ver datos reales de temperatura, viento, etc.
- Si aparece "datos simulados" o errores, verifica tu API key

### 2. Comprobar NASA Earthdata
- Los valores de clorofila deberían mostrar datos realistas para la costa chilena
- Si aparecen valores extraños, verifica tus credenciales NASA

### 3. Verificar en consola del navegador
- Abre Developer Tools (F12)
- Ve a la pestaña "Console"
- No deberías ver errores relacionados con API keys

---

## 💰 Costos Estimados

### Desarrollo (< 100 usuarios/día):
- **OpenWeatherMap**: Gratuito (1,000 llamadas/día)
- **NASA Earthdata**: Gratuito
- **Total**: $0/mes

### Producción (500-1000 usuarios/día):
- **OpenWeatherMap**: $40/mes (plan básico)
- **NASA Earthdata**: Gratuito
- **Total**: ~$40/mes

---

## 🆘 Solución de Problemas

### Error: "API key not found"
- Verifica que el archivo `.env.local` esté en la raíz del proyecto
- Asegúrate de que las variables empiecen con `NEXT_PUBLIC_` para el frontend
- Reinicia el servidor de desarrollo

### Error: "Failed to fetch weather data"
- Verifica tu API key de OpenWeatherMap
- Comprueba tu conexión a internet
- Verifica que no hayas excedido el límite de llamadas

### Error: "NASA credentials not found"
- Verifica tu username y password de NASA Earthdata
- Asegúrate de haber activado el acceso a datos oceanográficos
- Las credenciales son case-sensitive

### Datos que parecen incorrectos
- Verifica que las coordenadas estén dentro de aguas chilenas
- Comprueba que las APIs estén respondiendo correctamente
- Los datos de NASA pueden tener retraso de 1-2 días

---

## 📞 Soporte

Si necesitas ayuda adicional:
- **OpenWeatherMap**: https://openweathermap.org/support
- **NASA Earthdata**: https://earthdata.nasa.gov/learn/user-resources/help-and-support
- **Documentación del proyecto**: README.md