# 🎣 Pesca App - Aplicación para Pescadores Artesanales

Una aplicación web moderna desarrollada con Next.js que proporciona información meteorológica y oceanográfica en tiempo real para pescadores artesanales de la costa chilena.

## 🌊 Características

- **Datos meteorológicos en tiempo real**: Viento, rachas, presión atmosférica, temperatura
- **Condiciones marinas**: Altura de olas, mareas, temperatura del agua
- **Productividad oceánica**: Niveles de clorofila-a y zonas productivas
- **Recomendaciones de pesca**: Basadas en condiciones actuales
- **Alertas de seguridad**: Avisos sobre condiciones peligrosas
- **Interfaz responsive**: Optimizada para móviles y tablets

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd pesca_app

# Instalar dependencias
npm install
```

### 2. Configuración de APIs

⚠️ **IMPORTANTE**: Antes de ejecutar la aplicación, necesitas configurar las API keys.

**Lee la guía completa**: [API_SETUP.md](./API_SETUP.md)

**Resumen rápido**:
1. Obtén una API key gratuita de [OpenWeatherMap](https://openweathermap.org/api)
2. Crea una cuenta en [NASA Earthdata](https://urs.earthdata.nasa.gov/)
3. Configura el archivo `.env.local`:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=tu_api_key_aqui
NASA_EARTHDATA_USERNAME=tu_usuario_nasa
NASA_EARTHDATA_PASSWORD=tu_password_nasa
```

### 3. Ejecutar la aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Uso de la Aplicación

### Dashboard Principal
- **Gadgets meteorológicos**: Información en tiempo real sobre condiciones del mar
- **Códigos de colores**: Verde (favorable), Amarillo (precaución), Rojo (peligroso)
- **Recomendaciones automáticas**: Sugerencias basadas en las condiciones actuales

### Información Disponible
- 🌬️ **Viento**: Velocidad, dirección y rachas
- 🌊 **Oleaje**: Altura de olas y condiciones del mar
- 🌡️ **Temperatura**: Aire y agua
- 📊 **Presión atmosférica**: Tendencias del tiempo
- 🌧️ **Precipitación**: Lluvia actual y pronóstico
- 🔬 **Clorofila**: Productividad oceánica
- 🌙 **Mareas**: Estado actual y próximos cambios

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **APIs**: 
  - OpenWeatherMap (datos meteorológicos)
  - NASA Earthdata (datos oceanográficos)
- **Language**: TypeScript

## 🌍 Cobertura Geográfica

La aplicación está optimizada para la costa chilena, desde Arica hasta Punta Arenas, con límite de 20 millas náuticas desde la costa.

### Regiones soportadas:
- Arica y Parinacota
- Tarapacá
- Antofagasta
- Atacama
- Coquimbo
- Valparaíso
- O'Higgins
- Maule
- Ñuble
- Biobío
- La Araucanía
- Los Ríos
- Los Lagos
- Aysén
- Magallanes

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# APIs
NEXT_PUBLIC_OPENWEATHER_API_KEY=tu_api_key
NASA_EARTHDATA_USERNAME=tu_usuario
NASA_EARTHDATA_PASSWORD=tu_password

# Configuración regional
NEXT_PUBLIC_DEFAULT_LAT=-33.0472
NEXT_PUBLIC_DEFAULT_LON=-71.6127
NEXT_PUBLIC_MAX_DISTANCE_KM=37
```

### Personalización por Región

Puedes cambiar las coordenadas por defecto en el archivo `.env.local` para que la aplicación inicie en tu región específica.

## 🐛 Solución de Problemas

### No aparecen datos reales
1. Verifica que tus API keys estén configuradas correctamente
2. Comprueba la consola del navegador (F12) para errores
3. Asegúrate de que las coordenadas estén dentro del rango soportado

### Error de CORS
- Asegúrate de usar `NEXT_PUBLIC_` para variables del frontend
- Reinicia el servidor de desarrollo después de cambiar variables de entorno

### Datos de NASA no funcionan
- Verifica que hayas activado el acceso a datos oceanográficos
- Las credenciales son case-sensitive
- Los datos pueden tener retraso de 1-2 días

## 📝 Desarrollo

### Estructura del Proyecto

```
pesca_app/
├── app/
│   ├── components/     # Componentes React
│   ├── lib/           # Servicios y APIs
│   ├── types/         # Definiciones TypeScript
│   └── page.tsx       # Página principal
├── public/            # Archivos estáticos
└── API_SETUP.md      # Guía de configuración de APIs
```

### Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación de APIs**: [API_SETUP.md](./API_SETUP.md)
- **Issues**: Reporta problemas en GitHub Issues
- **Documentación técnica**: Ver comentarios en el código

---

**Desarrollado para pescadores artesanales chilenos** 🇨🇱