import { useEffect, useMemo, useState } from 'react'
import {
  calcularAsientosDisponibles,
  obtenerFechaMinima,
  rutas,
} from '../lib/viajes'

export default function SchedulesPage() {
  const [fecha, setFecha] = useState(obtenerFechaMinima())
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const sincronizar = () => setVersion((valorActual) => valorActual + 1)
    window.addEventListener('storage', sincronizar)

    return () => {
      window.removeEventListener('storage', sincronizar)
    }
  }, [])

  const filas = useMemo(
    () =>
      rutas.map((ruta) => ({
        ...ruta,
        asientosDisponibles: calcularAsientosDisponibles(ruta.destino, ruta.hora, fecha),
      })),
    [fecha, version]
  )

  return (
    <main className="page-shell">
      <section className="content-section">
        <div className="section-heading inline-heading">
          <div>
            <span className="eyebrow">Horarios</span>
            <h1>Salidas disponibles por fecha</h1>
          </div>

          <label className="filter-field">
            Fecha de viaje
            <input
              type="date"
              min={obtenerFechaMinima()}
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
            />
          </label>
        </div>

        <div className="table-shell">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Origen</th>
                <th>Destino</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Bus</th>
                <th>Asientos</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={`${fila.destino}-${fila.hora}`}>
                  <td>{fila.origen}</td>
                  <td>{fila.destinoLabel}</td>
                  <td>{fila.salidaLabel}</td>
                  <td>{fila.llegadaLabel}</td>
                  <td>{fila.bus}</td>
                  <td>
                    <span
                      className={
                        fila.asientosDisponibles === 0 ? 'status-badge full' : 'status-badge'
                      }
                    >
                      {fila.asientosDisponibles === 0
                        ? 'Completo'
                        : `${fila.asientosDisponibles} disponibles`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
