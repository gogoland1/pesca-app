# 🚀 Inicio Rápido - Pesca App

## ⏱️ Configuración en 5 minutos

### 1. Obtener API Keys (2-3 minutos)

#### OpenWeatherMap (GRATIS)
1. Ve a: https://openweathermap.org/api
2. Clic en "Sign Up" → Crea cuenta → Confirma email
3. Ve a: https://home.openweathermap.org/api_keys
4. Copia tu API key

#### NASA Earthdata (GRATIS)
1. Ve a: https://urs.earthdata.nasa.gov/
2. Clic en "Register" → Completa formulario
3. En "Study Area" → selecciona "Ocean/Marine Sciences"
4. Confirma email y guarda username/password

### 2. Configurar la App (1 minuto)

```bash
# 1. Editar configuración
nano .env.local

# 2. Pegar tus API keys:
NEXT_PUBLIC_OPENWEATHER_API_KEY=tu_api_key_aqui
NASA_EARTHDATA_USERNAME=tu_usuario_nasa  
NASA_EARTHDATA_PASSWORD=tu_password_nasa

# 3. Guardar y salir (Ctrl+X, Y, Enter)
```

### 3. Validar y Ejecutar (1 minuto)

```bash
# Validar que todo funcione
npm run validate-apis

# Si todo está OK, ejecutar la app
npm run dev
```

¡Listo! Abre http://localhost:3000

---

## 🆘 Si algo no funciona:

### Error: "API key not found"
```bash
# Verifica que el archivo existe
ls -la .env.local

# Si no existe, cópialo desde el ejemplo
cp .env.example .env.local
nano .env.local
```

### Error: "Failed to fetch weather data"
- ✅ Verifica tu API key de OpenWeatherMap
- ✅ Espera unos minutos (las API keys nuevas pueden tardar)
- ✅ Prueba el validador: `npm run validate-apis`

### Error: NASA credentials
- ✅ Username/password son case-sensitive
- ✅ Asegúrate de haber activado acceso a datos oceanográficos

---

## 🎯 Ubicaciones de prueba

Cambia las coordenadas en `.env.local` para probar diferentes ubicaciones:

```env
# Valparaíso (por defecto)
NEXT_PUBLIC_DEFAULT_LAT=-33.0472
NEXT_PUBLIC_DEFAULT_LON=-71.6127

# Antofagasta
NEXT_PUBLIC_DEFAULT_LAT=-23.6509
NEXT_PUBLIC_DEFAULT_LON=-70.3975

# Concepción  
NEXT_PUBLIC_DEFAULT_LAT=-36.8201
NEXT_PUBLIC_DEFAULT_LON=-73.0444
```

---

## 📱 ¿Qué verás?

- 🌬️ **Viento en tiempo real**: Velocidad, dirección, rachas
- 🌊 **Condiciones del mar**: Oleaje, mareas, temperatura
- 🔬 **Productividad**: Niveles de clorofila y zonas productivas  
- ⚠️ **Alertas**: Avisos de seguridad automáticos
- 🎣 **Recomendaciones**: Sugerencias de pesca basadas en condiciones

---

## 💡 Tips

- **Colores**: Verde = bueno, Amarillo = precaución, Rojo = peligroso
- **Actualización**: Usa el botón ↻ para datos frescos
- **Móvil**: La app funciona perfectamente en smartphones
- **Offline**: Los datos se mantienen temporalmente sin conexión

¿Necesitas ayuda? Lee el [API_SETUP.md](./API_SETUP.md) completo.