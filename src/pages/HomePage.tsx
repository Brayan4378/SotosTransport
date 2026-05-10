import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import busEjecutivo from '../../imagenes/bus1.webp'
import busEstandar from '../../imagenes/bus2.jpg'
import busEconomico from '../../imagenes/bus3.png'
import confort from '../../imagenes/confort.png'
import puntualidad from '../../imagenes/puntualidad.png'
import seguridad from '../../imagenes/seguridad.png'
import { obtenerFechaMinima, rutas } from '../lib/viajes'

const medios = [
  {
    titulo: 'Bus Ejecutivo',
    imagen: busEjecutivo,
    descripcion:
      'Asientos reclinables, aire acondicionado y un trayecto pensado para viajes de mayor comodidad.',
  },
  {
    titulo: 'Bus Estandar',
    imagen: busEstandar,
    descripcion:
      'Una opcion equilibrada para grupos y viajeros frecuentes que buscan costo y confort.',
  },
  {
    titulo: 'Bus Economico',
    imagen: busEconomico,
    descripcion:
      'La alternativa mas accesible de la flota, con enfoque en puntualidad y seguridad.',
  },
]

const servicios = [
  {
    titulo: 'Seguridad',
    imagen: seguridad,
    descripcion:
      'Mantenemos controles operativos y seguimiento de cada salida para respaldar el viaje completo.',
  },
  {
    titulo: 'Puntualidad',
    imagen: puntualidad,
    descripcion:
      'Las rutas destacadas tienen horarios definidos y seguimiento constante para reducir demoras.',
  },
  {
    titulo: 'Confort',
    imagen: confort,
    descripcion:
      'Cabinas limpias, asientos comodos y una experiencia de viaje pensada para trayectos intermunicipales.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [destino, setDestino] = useState('bogota')
  const [fecha, setFecha] = useState(obtenerFechaMinima())
  const [pasajeros, setPasajeros] = useState('1')

  const manejarBusqueda = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    navigate('/reservas', {
      state: {
        destino,
        fecha,
        pasajeros: Number(pasajeros),
      },
    })
  }

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Operacion terrestre regional</span>
          <h1>Viaja seguro y puntual desde Armenia</h1>
          <p>
            Soto&apos;s Transport centraliza rutas, reservas y control operativo en una sola interfaz
            React.
          </p>
        </div>

        <form className="booking-card" onSubmit={manejarBusqueda}>
          <h2>Busca tu proximo viaje</h2>

          <label>
            Origen
            <input type="text" value="Armenia" disabled />
          </label>

          <label>
            Destino
            <select value={destino} onChange={(event) => setDestino(event.target.value)}>
              <option value="bogota">Bogota</option>
              <option value="medellin">Medellin</option>
              <option value="cali">Cali</option>
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
              onChange={(event) => setPasajeros(event.target.value)}
            />
          </label>

          <button type="submit" className="primary-button">
            Buscar
          </button>
        </form>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Nuestros medios de transporte</h2>
          <p>La flota cubre tres tipos de servicio para ajustar presupuesto, capacidad y confort.</p>
        </div>

        <div className="card-grid thirds">
          {medios.map((medio) => (
            <article key={medio.titulo} className="content-card">
              <img src={medio.imagen} alt={medio.titulo} />
              <h3>{medio.titulo}</h3>
              <p>{medio.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section alt-section">
        <div className="section-heading">
          <h2>Servicios destacados</h2>
          <p>La propuesta comercial sigue enfocada en seguridad, puntualidad y confort.</p>
        </div>

        <div className="card-grid thirds">
          {servicios.map((servicio) => (
            <article key={servicio.titulo} className="content-card compact">
              <img src={servicio.imagen} alt={servicio.titulo} className="icon-asset" />
              <h3>{servicio.titulo}</h3>
              <p>{servicio.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Horarios destacados</h2>
          <p>Estas salidas ya estan configuradas en la logica de reservas y operaciones.</p>
        </div>

        <div className="schedule-highlights">
          {rutas.map((ruta) => (
            <article key={`${ruta.destino}-${ruta.hora}`} className="mini-panel">
              <strong>
                {ruta.origen} - {ruta.destinoLabel}
              </strong>
              <span>
                {ruta.salidaLabel} - {ruta.llegadaLabel}
              </span>
              <small>{ruta.bus}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
