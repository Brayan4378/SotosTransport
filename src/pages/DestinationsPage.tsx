import { useEffect, useState } from 'react'
import { obtenerClimaDestino, type DestinationWeather } from '../lib/travelApis'
import { destinosInfo, type Destino } from '../lib/viajes'

const DESTINOS = ['bogota', 'medellin', 'cali'] as const
type ClimaPorDestino = Partial<Record<Destino, DestinationWeather>>

export default function DestinationsPage() {
  const [clima, setClima] = useState<ClimaPorDestino>({})
  const [cargandoClima, setCargandoClima] = useState(true)
  const [mensajeClima, setMensajeClima] = useState('')

  useEffect(() => {
    let activo = true

    const cargarClima = async () => {
      setCargandoClima(true)
      setMensajeClima('')

      const resultados = await Promise.allSettled(DESTINOS.map((destino) => obtenerClimaDestino(destino)))

      if (!activo) {
        return
      }

      const siguienteClima: ClimaPorDestino = {}

      resultados.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled') {
          siguienteClima[DESTINOS[index]] = resultado.value
        }
      })

      setClima(siguienteClima)
      setCargandoClima(false)

      if (Object.keys(siguienteClima).length === 0) {
        setMensajeClima('No fue posible consultar el clima en tiempo real.')
      }
    }

    void cargarClima()

    return () => {
      activo = false
    }
  }, [])

  return (
    <main className="page-shell">
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Destinos</span>
          <h1>Rutas turisticas y ejecutivas disponibles</h1>
          <p>La migracion conserva las tres ciudades del proyecto original y las organiza en React.</p>
        </div>

        <div className="destination-grid">
          {destinosInfo.map((destino) => (
            <article key={destino.id} className="destination-card">
              <img src={destino.imagen} alt={destino.titulo} />
              <div>
                <h2>{destino.titulo}</h2>
                <p>{destino.descripcion}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section alt-section">
        <div className="section-heading">
          <span className="eyebrow">API 1</span>
          <h2>Clima actual para planear el viaje</h2>
          <p>Consulta de geolocalizacion y clima en tiempo real con Open-Meteo.</p>
        </div>

        {cargandoClima ? <div className="info-strip">Consultando condiciones climaticas...</div> : null}
        {mensajeClima ? <div className="info-strip error-strip">{mensajeClima}</div> : null}

        <div className="card-grid thirds">
          {destinosInfo.map((destino) => {
            const climaDestino = clima[destino.id as Destino]

            return (
              <article key={`clima-${destino.id}`} className="metric-card">
                <h2>{destino.titulo}</h2>
                {climaDestino ? (
                  <>
                    <p>{climaDestino.description}</p>
                    <strong>{climaDestino.temperature} C</strong>
                    <span>Sensacion termica: {climaDestino.apparentTemperature} C</span>
                    <span>Viento: {climaDestino.windSpeed} km/h</span>
                    <span>Lluvia probable: {climaDestino.precipitationProbability}%</span>
                    <span>
                      Coord.: {climaDestino.latitude.toFixed(2)}, {climaDestino.longitude.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <>
                    <p>Sin datos en este momento.</p>
                    <strong>API no disponible</strong>
                  </>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
