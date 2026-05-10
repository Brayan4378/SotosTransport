import { useEffect, useMemo, useState } from 'react'
import {
  calcularAsientosDisponibles,
  formatearPrecio,
  obtenerFechaMinima,
  obtenerHorariosPorDestino,
  obtenerReservas,
  obtenerRuta,
  preciosPorDestino,
  type Destino,
} from '../lib/viajes'

export default function OperationsPage() {
  const [destino, setDestino] = useState<Destino>('bogota')
  const [hora, setHora] = useState('06:00')
  const [fecha, setFecha] = useState(obtenerFechaMinima())
  const [pasajeros, setPasajeros] = useState(1)
  const [version, setVersion] = useState(0)

  const horariosDisponibles = useMemo(() => obtenerHorariosPorDestino(destino), [destino])

  useEffect(() => {
    if (!horariosDisponibles.some((ruta) => ruta.hora === hora)) {
      setHora(horariosDisponibles[0]?.hora ?? '')
    }
  }, [hora, horariosDisponibles])

  useEffect(() => {
    const sincronizar = () => setVersion((valorActual) => valorActual + 1)
    window.addEventListener('storage', sincronizar)

    return () => {
      window.removeEventListener('storage', sincronizar)
    }
  }, [])

  const rutaActiva = obtenerRuta(destino, hora)
  const reservasDia = useMemo(
    () => obtenerReservas().filter((reserva) => reserva.fecha === fecha),
    [fecha, version]
  )
  const totalIngresosDia = reservasDia.reduce((total, reserva) => total + reserva.precioTotal, 0)
  const totalPasajerosDia = reservasDia.reduce((total, reserva) => total + reserva.pasajeros, 0)
  const cuposDisponibles = rutaActiva ? calcularAsientosDisponibles(destino, hora, fecha) : 0
  const totalPrecio = preciosPorDestino[destino] * pasajeros
  const capacidad = rutaActiva?.capacidad ?? 0
  const ocupados = capacidad - cuposDisponibles
  const ocupacion = capacidad > 0 ? (ocupados / capacidad) * 100 : 0
  const contextoValido = Boolean(rutaActiva && fecha && pasajeros >= 1 && pasajeros <= 50)

  return (
    <main className="page-shell">
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Operaciones</span>
          <h1>Centro operativo</h1>
          <p>Matematicas del sistema calculadas con las reservas guardadas en la aplicacion React.</p>
        </div>

        <div className="operations-form">
          <label>
            Destino
            <select value={destino} onChange={(event) => setDestino(event.target.value as Destino)}>
              <option value="bogota">Bogota</option>
              <option value="medellin">Medellin</option>
              <option value="cali">Cali</option>
            </select>
          </label>

          <label>
            Horario
            <select value={hora} onChange={(event) => setHora(event.target.value)}>
              {horariosDisponibles.map((ruta) => (
                <option key={ruta.hora} value={ruta.hora}>
                  {ruta.salidaLabel}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fecha
            <input
              type="date"
              min={obtenerFechaMinima()}
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
            />
          </label>

          <label>
            Pasajeros
            <input
              type="number"
              min={1}
              max={50}
              value={pasajeros}
              onChange={(event) => setPasajeros(Number(event.target.value) || 1)}
            />
          </label>
        </div>

        <div className="card-grid thirds">
          <article className="metric-card">
            <h2>Operacion 1</h2>
            <p>Total del viaje segun cantidad de pasajeros</p>
            <strong>{contextoValido ? formatearPrecio(totalPrecio) : 'Contexto invalido'}</strong>
          </article>

          <article className="metric-card">
            <h2>Operacion 2</h2>
            <p>Cupos restantes del bus en la fecha seleccionada</p>
            <strong>
              {rutaActiva ? `${cuposDisponibles} disponibles en ${rutaActiva.bus}` : 'Sin ruta valida'}
            </strong>
          </article>

          <article className="metric-card">
            <h2>Operacion 3</h2>
            <p>Porcentaje de ocupacion real del bus</p>
            <strong>{rutaActiva ? `${ocupacion.toFixed(1)}%` : 'Sin ruta valida'}</strong>
          </article>

          <article className="metric-card">
            <h2>Operacion 4</h2>
            <p>Suma de pasajeros reservados en el dia</p>
            <strong>{totalPasajerosDia} pasajeros</strong>
          </article>

          <article className="metric-card">
            <h2>Operacion 5</h2>
            <p>Resumen rapido del contexto operativo</p>
            <strong>{rutaActiva ? `${rutaActiva.origen} - ${rutaActiva.destinoLabel}` : 'Sin ruta valida'}</strong>
            <span>{rutaActiva ? `${rutaActiva.bus} con ${rutaActiva.capacidad} cupos` : 'Sin bus asignado'}</span>
          </article>

          <article className="metric-card accent">
            <h2>Operacion 6</h2>
            <p>Ingresos y reservas del dia</p>
            <strong>{formatearPrecio(totalIngresosDia)}</strong>
            <span>{reservasDia.length} reservas registradas</span>
          </article>
        </div>
      </section>
    </main>
  )
}
