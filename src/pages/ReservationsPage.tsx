import {type FormEvent, useEffect, useMemo, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {convertirCop, formatearMoneda, obtenerTasasCambio, type ExchangeRates} from '../lib/travelApis'
import {
    calcularAsientosDisponibles,
    consejosViaje,
    formatearPrecio,
    guardarReservas,
    ofertasEspeciales,
    obtenerFechaMinima,
    obtenerHorariosPorDestino,
    obtenerReservas,
    preciosPorDestino,
    type Destino,
} from '../lib/viajes'

type ReservaState = {
    destino?: string
    fecha?: string
    pasajeros?: number
}

export default function ReservationsPage() {
    const location = useLocation()
    const state = (location.state as ReservaState | null) ?? null
    const destinoInicial = (state?.destino as Destino | undefined) ?? 'bogota'
    const [destino, setDestino] = useState<Destino>(destinoInicial)
    const [hora, setHora] = useState('06:00')
    const [fecha, setFecha] = useState(state?.fecha ?? obtenerFechaMinima())
    const [pasajeros, setPasajeros] = useState(String(state?.pasajeros ?? 1))
    const [mensaje, setMensaje] = useState('')
    const [tipoMensaje, setTipoMensaje] = useState<'mensaje-positivo' | 'mensaje-negativo' | ''>('')
    const [tasas, setTasas] = useState<ExchangeRates | null>(null)
    const [estadoTasas, setEstadoTasas] = useState<'cargando' | 'lista' | 'error'>('cargando')

    const horariosDisponibles = useMemo(() => obtenerHorariosPorDestino(destino), [destino])
    const rutaActiva = horariosDisponibles.find((ruta) => ruta.hora === hora) ?? horariosDisponibles[0]
    const asientosDisponibles = rutaActiva ? calcularAsientosDisponibles(destino, rutaActiva.hora, fecha) : 0
    const totalEstimado =
        Number.isInteger(Number(pasajeros)) && Number(pasajeros) > 0
            ? preciosPorDestino[destino] * Number(pasajeros)
            : 0

    useEffect(() => {
        if (!horariosDisponibles.some((ruta) => ruta.hora === hora)) {
            setHora(horariosDisponibles[0]?.hora ?? '')
        }
    }, [hora, horariosDisponibles])

    useEffect(() => {
        let activo = true

        const cargarTasas = async () => {
            setEstadoTasas('cargando')

            try {
                const respuesta = await obtenerTasasCambio()

                if (!activo) {
                    return
                }

                setTasas(respuesta)
                setEstadoTasas('lista')
            } catch {
                if (!activo) {
                    return
                }

                setEstadoTasas('error')
            }
        }

        void cargarTasas()

        return () => {
            activo = false
        }
    }, [])

    const mostrarMensaje = (
        texto: string,
        tipo: 'mensaje-positivo' | 'mensaje-negativo'
    ) => {
        setMensaje(texto)
        setTipoMensaje(tipo)
    }

    const manejarReserva = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const pasajerosNumero = Number(pasajeros)
        const fechaSeleccionada = new Date(fecha)
        const hoy = new Date()
        const fechaLimite = new Date()
        fechaLimite.setDate(fechaLimite.getDate() + 365)

        hoy.setHours(0, 0, 0, 0)
        fechaSeleccionada.setHours(0, 0, 0, 0)
        fechaLimite.setHours(0, 0, 0, 0)

        if (!destino || !hora || !fecha) {
            mostrarMensaje('Debes seleccionar destino, horario y fecha.', 'mensaje-negativo')
            return
        }

        if (!Number.isInteger(pasajerosNumero) || pasajerosNumero < 1 || pasajerosNumero > 50) {
            mostrarMensaje('La cantidad de pasajeros debe estar entre 1 y 50.', 'mensaje-negativo')
            return
        }

        if (fechaSeleccionada < hoy) {
            mostrarMensaje('No puedes seleccionar una fecha pasada.', 'mensaje-negativo')
            return
        }

        if (fechaSeleccionada > fechaLimite) {
            mostrarMensaje('Solo puedes reservar con maximo 365 dias de anticipacion.', 'mensaje-negativo')
            return
        }

        if (pasajerosNumero > asientosDisponibles) {
            mostrarMensaje(`Solo quedan ${asientosDisponibles} asientos para esa salida.`, 'mensaje-negativo')
            return
        }

        const reservas = obtenerReservas()
        reservas.push({
            origen: 'Armenia',
            destino,
            hora,
            fecha,
            pasajeros: pasajerosNumero,
            precioTotal: preciosPorDestino[destino] * pasajerosNumero,
        })
        guardarReservas(reservas)

        mostrarMensaje('Reserva realizada con exito.', 'mensaje-positivo')
        setPasajeros('1')
    }

    const totalUsd = tasas ? formatearMoneda(convertirCop(totalEstimado, tasas.usd), 'USD') : null
    const totalEur = tasas ? formatearMoneda(convertirCop(totalEstimado, tasas.eur), 'EUR') : null

    return (
        <main className="page-shell">
            <section className="content-section reservations-layout">
                <div className="booking-panel">
                    <div className="section-heading">
                        <span className="eyebrow">Reservas</span>
                        <h1>Reserva tu viaje</h1>
                    </div>
                    <form className="form-grid" onSubmit={manejarReserva}>
                        <label>
                            Origen
                            <input type="text" value="Armenia" disabled/>
                        </label>

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
                                onChange={(event) => setPasajeros(event.target.value)}
                            />
                        </label>

                        <div className="summary-panel">
                            <strong>
                                {rutaActiva
                                    ? `Bus ${rutaActiva.bus}: ${asientosDisponibles} asientos disponibles`
                                    : 'Sin bus configurado'}
                            </strong>
                            <span>
                {totalEstimado > 0 ? `Total estimado: ${formatearPrecio(totalEstimado)}` : 'Sin total calculado'}
              </span>
                            <span>
                {estadoTasas === 'cargando'
                    ? 'Consultando conversion en USD y EUR...'
                    : estadoTasas === 'error'
                        ? 'No fue posible consultar la tasa de cambio.'
                        : `Equivalente aprox.: ${totalUsd} | ${totalEur}`}
              </span>
                        </div>

                        <button type="submit" className="primary-button">
                            Reservar
                        </button>

                        <p className={tipoMensaje}>{mensaje}</p>
                    </form>
                </div>

                <aside className="side-visual">
                    <img
                        src="https://media.istockphoto.com/id/1154164634/es/foto/autob%C3%BAs-blanco-viajando-en-la-carretera-de-asfalto-alrededor-de-la-l%C3%ADnea-de-%C3%A1rboles-en-el.jpg?b=1&s=1024x1024&w=0&k=20&c=-DNj2gk6ZYE8PrGwbV2XfHiOvYf17Elw4iwdI1wycSM="
                        alt="Bus en carretera"
                    />
                </aside>
            </section>

            <section className="content-section">
                <div className="section-heading">
                    <span className="eyebrow">API 2</span>
                    <h2>Conversion monetaria en tiempo real</h2>
                    <p>La reserva tambien consulta una API publica para expresar el total en otras monedas.</p>
                </div>

                <div className="card-grid thirds">
                    <article className="metric-card">
                        <h2>Total en COP</h2>
                        <p>Tarifa base calculada dentro del sistema</p>
                        <strong>{formatearPrecio(totalEstimado)}</strong>
                    </article>

                    <article className="metric-card">
                        <h2>Total en USD</h2>
                        <p>Consulta en vivo a ExchangeRate-API</p>
                        <strong>{estadoTasas === 'lista' && totalUsd ? totalUsd : 'Sin conversion'}</strong>
                    </article>

                    <article className="metric-card">
                        <h2>Total en EUR</h2>
                        <p>Util para pasajeros o cotizaciones internacionales</p>
                        <strong>{estadoTasas === 'lista' && totalEur ? totalEur : 'Sin conversion'}</strong>
                        <span>{tasas?.updatedAt ? `Actualizado: ${tasas.updatedAt}` : 'Sin fecha de actualizacion'}</span>
                    </article>
                </div>
            </section>

            <section className="content-section alt-section">
                <div className="section-heading">
                    <h2>Ofertas especiales</h2>
                    <p>Los valores se mantienen alineados con la logica de precios usada en operaciones.</p>
                </div>

                <div className="card-grid thirds">
                    {ofertasEspeciales.map((oferta) => (
                        <article key={oferta.destino} className="offer-card">
                            <img src={oferta.imagen} alt={oferta.destino}/>
                            <div>
                                <h3>{oferta.destino}</h3>
                                <span className="tag">Acumula millas</span>
                                <p>Por trayecto desde</p>
                                <strong>{oferta.precio}</strong>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="content-section">
                <div className="section-heading">
                    <h2>Preparate para tu viaje</h2>
                    <p>Se conservaron las recomendaciones de la version HTML dentro de la vista React.</p>
                </div>

                <div className="card-grid thirds">
                    {consejosViaje.map((consejo) => (
                        <article key={consejo.titulo} className="content-card">
                            <img src={consejo.imagen} alt={consejo.titulo}/>
                            <h3>{consejo.titulo}</h3>
                            <p>{consejo.descripcion}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}
