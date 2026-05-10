import { type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ADMIN_EMAIL,
  ADMIN_NAME,
  esAdministrador,
  obtenerUsuarioActivo,
  type Usuario,
} from '../lib/session'

type MensajeSoporte = {
  id: string
  autor: 'admin' | 'cliente'
  remitenteEmail: string
  remitenteNombre: string
  destinatarioEmail: string
  texto: string
  fecha: string
}

type Conversacion = {
  email: string
  nombre: string
  ultimoMensaje: string
  fecha: string
}

const CHAT_STORAGE_KEY = 'chat_soporte_sotostransport_v2'
const CHAT_UPDATED_EVENT = 'chat:updated'

export default function ContactPage() {
  const [usuarioActivo, setUsuarioActivo] = useState<Usuario | null>(() => obtenerUsuarioActivo())
  const [mensajes, setMensajes] = useState<MensajeSoporte[]>(() =>
    cargarMensajesGuardados(obtenerUsuarioActivo())
  )
  const [texto, setTexto] = useState('')
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState('')

  useEffect(() => {
    const sincronizar = () => {
      const usuario = obtenerUsuarioActivo()
      setUsuarioActivo(usuario)
      setMensajes(cargarMensajesGuardados(usuario))
    }

    window.addEventListener('storage', sincronizar)
    window.addEventListener(CHAT_UPDATED_EVENT, sincronizar)

    return () => {
      window.removeEventListener('storage', sincronizar)
      window.removeEventListener(CHAT_UPDATED_EVENT, sincronizar)
    }
  }, [])

  const conversaciones = useMemo(() => {
    if (!esAdministrador(usuarioActivo)) {
      return []
    }

    const mapa = new Map<string, Conversacion>()

    mensajes.forEach((mensaje) => {
      const emailCliente = mensaje.autor === 'cliente' ? mensaje.remitenteEmail : mensaje.destinatarioEmail

      if (emailCliente === ADMIN_EMAIL) {
        return
      }

      mapa.set(emailCliente, {
        email: emailCliente,
        nombre: mensaje.autor === 'cliente' ? mensaje.remitenteNombre : nombreDesdeEmail(emailCliente),
        ultimoMensaje: mensaje.texto,
        fecha: mensaje.fecha,
      })
    })

    return Array.from(mapa.values()).sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [mensajes, usuarioActivo])

  useEffect(() => {
    if (!esAdministrador(usuarioActivo)) {
      setConversacionSeleccionada('')
      return
    }

    if (!conversacionSeleccionada && conversaciones[0]) {
      setConversacionSeleccionada(conversaciones[0].email)
      return
    }

    if (
      conversacionSeleccionada &&
      !conversaciones.some((conversacion) => conversacion.email === conversacionSeleccionada)
    ) {
      setConversacionSeleccionada(conversaciones[0]?.email ?? '')
    }
  }, [conversacionSeleccionada, conversaciones, usuarioActivo])

  const mensajesVisibles = useMemo(() => {
    if (!usuarioActivo) {
      return []
    }

    if (esAdministrador(usuarioActivo)) {
      if (!conversacionSeleccionada) {
        return []
      }

      return mensajes.filter(
        (mensaje) =>
          mensaje.remitenteEmail === conversacionSeleccionada ||
          mensaje.destinatarioEmail === conversacionSeleccionada
      )
    }

    return mensajes.filter(
      (mensaje) =>
        mensaje.remitenteEmail === usuarioActivo.email || mensaje.destinatarioEmail === usuarioActivo.email
    )
  }, [conversacionSeleccionada, mensajes, usuarioActivo])

  const enviarMensaje = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const contenido = texto.trim()

    if (!contenido || !usuarioActivo) {
      return
    }

    if (esAdministrador(usuarioActivo) && !conversacionSeleccionada) {
      return
    }

    const nuevoMensaje: MensajeSoporte = esAdministrador(usuarioActivo)
      ? {
          id: crearId(),
          autor: 'admin',
          remitenteEmail: ADMIN_EMAIL,
          remitenteNombre: ADMIN_NAME,
          destinatarioEmail: conversacionSeleccionada,
          texto: contenido,
          fecha: new Date().toISOString(),
        }
      : {
          id: crearId(),
          autor: 'cliente',
          remitenteEmail: usuarioActivo.email,
          remitenteNombre: usuarioActivo.usuario,
          destinatarioEmail: ADMIN_EMAIL,
          texto: contenido,
          fecha: new Date().toISOString(),
        }

    const siguientesMensajes = [...mensajes, nuevoMensaje]
    guardarMensajes(siguientesMensajes)
    setMensajes(siguientesMensajes)
    setTexto('')
  }

  const titulo = esAdministrador(usuarioActivo) ? 'Bandeja del administrador' : 'Mensajes con el administrador'
  const descripcion = esAdministrador(usuarioActivo)
    ? 'Responde manualmente las solicitudes de los clientes desde esta vista.'
    : 'Escribe tu solicitud y el administrador de Soto Transport te respondera aqui.'

  return (
    <main className="page-shell">
      <section className="content-section support-layout">
        {esAdministrador(usuarioActivo) ? (
          <aside className="support-sidebar">
            <div className="section-heading">
              <span className="eyebrow">Soporte</span>
              <h2>Clientes</h2>
              <p>Selecciona una conversacion para responder como administrador.</p>
            </div>

            <div className="conversation-list">
              {conversaciones.length > 0 ? (
                conversaciones.map((conversacion) => (
                  <button
                    key={conversacion.email}
                    type="button"
                    className={
                      conversacionSeleccionada === conversacion.email
                        ? 'conversation-item active'
                        : 'conversation-item'
                    }
                    onClick={() => setConversacionSeleccionada(conversacion.email)}
                  >
                    <strong>{conversacion.nombre}</strong>
                    <span>{conversacion.email}</span>
                    <small>{conversacion.ultimoMensaje}</small>
                  </button>
                ))
              ) : (
                <div className="empty-state">No hay mensajes de clientes todavia.</div>
              )}
            </div>
          </aside>
        ) : null}

        <div className="chat-panel">
          <div className="section-heading">
            <span className="eyebrow">Contacto</span>
            <h1>{titulo}</h1>
            <p>{descripcion}</p>
          </div>

          <div className="chat-box">
            {mensajesVisibles.length > 0 ? (
              mensajesVisibles.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={mensaje.autor === 'admin' ? 'chat-message admin' : 'chat-message user'}
                >
                  <strong className="message-meta">
                    {mensaje.autor === 'admin' ? ADMIN_NAME : mensaje.remitenteNombre}
                  </strong>
                  <p>{mensaje.texto}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                {esAdministrador(usuarioActivo)
                  ? 'Selecciona una conversacion para responder.'
                  : 'Todavia no hay mensajes. Escribe el primero para contactar al administrador.'}
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={enviarMensaje}>
            <input
              type="text"
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder={
                esAdministrador(usuarioActivo)
                  ? 'Escribe la respuesta para el cliente'
                  : 'Escribe tu mensaje para el administrador'
              }
              disabled={esAdministrador(usuarioActivo) && !conversacionSeleccionada}
            />
            <button
              type="submit"
              className="primary-button"
              disabled={esAdministrador(usuarioActivo) && !conversacionSeleccionada}
            >
              Enviar
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function cargarMensajesGuardados(usuarioActivo: Usuario | null): MensajeSoporte[] {
  const contenido = localStorage.getItem(CHAT_STORAGE_KEY)
  const mensajes = contenido ? parsearMensajes(contenido) : []

  if (!usuarioActivo || esAdministrador(usuarioActivo)) {
    return mensajes
  }

  const existeConversacion = mensajes.some(
    (mensaje) => mensaje.remitenteEmail === usuarioActivo.email || mensaje.destinatarioEmail === usuarioActivo.email
  )

  if (existeConversacion) {
    return mensajes
  }

  const mensajeInicial: MensajeSoporte = {
    id: crearId(),
    autor: 'admin',
    remitenteEmail: ADMIN_EMAIL,
    remitenteNombre: ADMIN_NAME,
    destinatarioEmail: usuarioActivo.email,
    texto: 'Hola. Soy el administrador de Soto Transport. Puedes escribir aqui tu solicitud.',
    fecha: new Date().toISOString(),
  }

  const siguientesMensajes = [...mensajes, mensajeInicial]
  guardarMensajes(siguientesMensajes)
  return siguientesMensajes
}

function parsearMensajes(contenido: string): MensajeSoporte[] {
  try {
    return JSON.parse(contenido) as MensajeSoporte[]
  } catch {
    return []
  }
}

function guardarMensajes(mensajes: MensajeSoporte[]): void {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(mensajes))
  window.dispatchEvent(new Event(CHAT_UPDATED_EVENT))
}

function crearId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function nombreDesdeEmail(email: string): string {
  return email.split('@')[0].replace(/[._-]/g, ' ')
}
