import type { Destino } from './viajes'

export type DestinationWeather = {
  city: string
  latitude: number
  longitude: number
  temperature: number
  apparentTemperature: number
  windSpeed: number
  precipitationProbability: number
  weatherCode: number
  description: string
  time: string
}

export type ExchangeRates = {
  usd: number
  eur: number
  updatedAt: string
}

const destinosApi: Record<Destino, { city: string; country: string }> = {
  bogota: { city: 'Bogota', country: 'Colombia' },
  medellin: { city: 'Medellin', country: 'Colombia' },
  cali: { city: 'Cali', country: 'Colombia' },
}

type GeocodingResponse = {
  results?: Array<{
    latitude: number
    longitude: number
    name: string
  }>
}

type ForecastResponse = {
  current?: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    wind_speed_10m: number
    precipitation_probability: number
    weather_code: number
  }
}

type ExchangeResponse = {
  result?: string
  time_last_update_utc?: string
  rates?: Record<string, number>
}

export async function obtenerClimaDestino(destino: Destino): Promise<DestinationWeather> {
  const config = destinosApi[destino]
  const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
  geocodingUrl.searchParams.set('name', config.city)
  geocodingUrl.searchParams.set('count', '1')
  geocodingUrl.searchParams.set('language', 'es')
  geocodingUrl.searchParams.set('format', 'json')
  geocodingUrl.searchParams.set('country', config.country)

  const geocodingResponse = await fetch(geocodingUrl, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!geocodingResponse.ok) {
    throw new Error('No fue posible consultar la geolocalizacion del destino.')
  }

  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse
  const ciudad = geocodingData.results?.[0]

  if (!ciudad) {
    throw new Error('La API de geolocalizacion no devolvio resultados.')
  }

  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
  forecastUrl.searchParams.set('latitude', String(ciudad.latitude))
  forecastUrl.searchParams.set('longitude', String(ciudad.longitude))
  forecastUrl.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,wind_speed_10m,precipitation_probability,weather_code'
  )
  forecastUrl.searchParams.set('timezone', 'America/Bogota')

  const forecastResponse = await fetch(forecastUrl, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!forecastResponse.ok) {
    throw new Error('No fue posible consultar el clima del destino.')
  }

  const forecastData = (await forecastResponse.json()) as ForecastResponse
  const current = forecastData.current

  if (!current) {
    throw new Error('La API de clima no devolvio informacion actual.')
  }

  return {
    city: ciudad.name,
    latitude: ciudad.latitude,
    longitude: ciudad.longitude,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    windSpeed: current.wind_speed_10m,
    precipitationProbability: current.precipitation_probability,
    weatherCode: current.weather_code,
    description: describirClima(current.weather_code),
    time: current.time,
  }
}

export async function obtenerTasasCambio(): Promise<ExchangeRates> {
  const response = await fetch('https://open.er-api.com/v6/latest/COP', {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('No fue posible consultar la tasa de cambio.')
  }

  const data = (await response.json()) as ExchangeResponse

  if (data.result !== 'success' || !data.rates?.USD || !data.rates?.EUR) {
    throw new Error('La API de conversion monetaria devolvio una respuesta incompleta.')
  }

  return {
    usd: data.rates.USD,
    eur: data.rates.EUR,
    updatedAt: data.time_last_update_utc ?? '',
  }
}

export function convertirCop(valorCop: number, tasa: number): number {
  return valorCop * tasa
}

export function formatearMoneda(valor: number, moneda: 'COP' | 'USD' | 'EUR'): string {
  const locale = moneda === 'COP' ? 'es-CO' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: 2,
  }).format(valor)
}

function describirClima(codigo: number): string {
  if (codigo === 0) {
    return 'Cielo despejado'
  }

  if ([1, 2, 3].includes(codigo)) {
    return 'Nubes parciales'
  }

  if ([45, 48].includes(codigo)) {
    return 'Neblina'
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65].includes(codigo)) {
    return 'Lluvia'
  }

  if ([66, 67, 71, 73, 75, 77].includes(codigo)) {
    return 'Precipitacion intensa'
  }

  if ([80, 81, 82].includes(codigo)) {
    return 'Chubascos'
  }

  if ([95, 96, 99].includes(codigo)) {
    return 'Tormenta'
  }

  return 'Condicion variable'
}
