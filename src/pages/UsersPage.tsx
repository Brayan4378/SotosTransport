import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  esAdministrador,
  guardarUsuarios,
  obtenerUsuarioActivo,
  obtenerUsuarios,
  USERS_UPDATED_EVENT,
  type Usuario,
} from '../lib/session'

type UserFormState = {
  usuario: string
  documento: string
  edad: string
  email: string
  password: string
}

const FORMULARIO_INICIAL: UserFormState = {
  usuario: '',
  documento: '',
  edad: '',
  email: '',
  password: '',
}

export default function UsersPage() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => obtenerUsuarios())
  const [formulario, setFormulario] = useState<UserFormState>(FORMULARIO_INICIAL)
  const [documentoEnEdicion, setDocumentoEnEdicion] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState<'mensaje-positivo' | 'mensaje-negativo' | ''>('')

  useEffect(() => {
    const sincronizarUsuarios = () => {
      setUsuarios(obtenerUsuarios())
    }

    window.addEventListener('storage', sincronizarUsuarios)
    window.addEventListener(USERS_UPDATED_EVENT, sincronizarUsuarios)

    return () => {
      window.removeEventListener('storage', sincronizarUsuarios)
      window.removeEventListener(USERS_UPDATED_EVENT, sincronizarUsuarios)
    }
  }, [])

  const usuarioActivo = useMemo(
    () => usuarios.find((usuario) => usuario.validacion === true) ?? obtenerUsuarioActivo(),
    [usuarios]
  )

  const actualizarCampo = (campo: keyof UserFormState, valor: string) => {
    setFormulario((estadoActual) => ({
      ...estadoActual,
      [campo]: valor,
    }))
  }

  const mostrarMensaje = (texto: string, tipo: 'mensaje-positivo' | 'mensaje-negativo') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
  }

  const limpiarFormulario = () => {
    setFormulario(FORMULARIO_INICIAL)
    setDocumentoEnEdicion(null)
  }

  const validarFormulario = (): UserFormState | null => {
    const nombreNormalizado = formulario.usuario.trim().replace(/\s+/g, ' ')
    const documentoNormalizado = formulario.documento.trim()
    const edadNumero = Number(formulario.edad)
    const correoNormalizado = formulario.email.trim().toLowerCase()
    const password = formulario.password

    const nombreValido = /^[A-Za-z ]{3,40}$/.test(nombreNormalizado)
    const documentoValido = /^\d{6,12}$/.test(documentoNormalizado)
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correoNormalizado)
    const passwordValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,24}$/.test(
      password
    )

    if (!nombreNormalizado || !documentoNormalizado || !formulario.edad || !correoNormalizado || !password) {
      mostrarMensaje('Todos los campos del usuario son obligatorios.', 'mensaje-negativo')
      return null
    }

    if (!nombreValido) {
      mostrarMensaje('El nombre debe tener entre 3 y 40 letras y solo espacios.', 'mensaje-negativo')
      return null
    }

    if (!documentoValido) {
      mostrarMensaje('El documento debe tener entre 6 y 12 digitos.', 'mensaje-negativo')
      return null
    }

    if (!Number.isInteger(edadNumero) || edadNumero < 18 || edadNumero > 100) {
      mostrarMensaje('La edad debe ser un numero entero entre 18 y 100.', 'mensaje-negativo')
      return null
    }

    if (!correoValido) {
      mostrarMensaje('Ingresa un correo electronico valido.', 'mensaje-negativo')
      return null
    }

    if (!passwordValida) {
      mostrarMensaje(
        'La contrasena debe tener 8 a 24 caracteres, mayuscula, minuscula, numero y simbolo.',
        'mensaje-negativo'
      )
      return null
    }

    return {
      usuario: nombreNormalizado,
      documento: documentoNormalizado,
      edad: String(edadNumero),
      email: correoNormalizado,
      password,
    }
  }

  const manejarGuardar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const datosValidados = validarFormulario()

    if (!datosValidados) {
      return
    }

    const correoDuplicado = usuarios.some(
      (usuario) =>
        usuario.email.toLowerCase() === datosValidados.email &&
        usuario.documento !== documentoEnEdicion
    )
    const documentoDuplicado = usuarios.some(
      (usuario) =>
        usuario.documento === datosValidados.documento &&
        usuario.documento !== documentoEnEdicion
    )

    if (correoDuplicado) {
      mostrarMensaje('Ese correo electronico ya esta registrado.', 'mensaje-negativo')
      return
    }

    if (documentoDuplicado) {
      mostrarMensaje('Ese documento ya esta registrado.', 'mensaje-negativo')
      return
    }

    if (documentoEnEdicion) {
      const usuariosActualizados = usuarios.map((usuario) =>
        usuario.documento === documentoEnEdicion
          ? {
              ...usuario,
              ...datosValidados,
            }
          : usuario
      )

      guardarUsuarios(usuariosActualizados)
      setUsuarios(usuariosActualizados)
      mostrarMensaje('Usuario actualizado correctamente.', 'mensaje-positivo')
    } else {
      const usuariosActualizados = [
        ...usuarios,
        {
          ...datosValidados,
          rol: 'cliente' as const,
          validacion: false,
        },
      ]

      guardarUsuarios(usuariosActualizados)
      setUsuarios(usuariosActualizados)
      mostrarMensaje('Usuario creado correctamente.', 'mensaje-positivo')
    }

    limpiarFormulario()
  }

  const iniciarEdicion = (usuario: Usuario) => {
    if (usuario.rol === 'admin') {
      mostrarMensaje('El administrador quemado no se puede editar desde esta vista.', 'mensaje-negativo')
      return
    }

    setDocumentoEnEdicion(usuario.documento)
    setFormulario({
      usuario: usuario.usuario,
      documento: usuario.documento,
      edad: usuario.edad,
      email: usuario.email,
      password: usuario.password,
    })
    setMensaje('')
    setTipoMensaje('')
  }

  const eliminarUsuario = (documento: string) => {
    const usuarioSeleccionado = usuarios.find((usuario) => usuario.documento === documento) ?? null

    if (usuarioSeleccionado?.rol === 'admin') {
      mostrarMensaje('El administrador quemado no se puede eliminar.', 'mensaje-negativo')
      return
    }

    const usuariosActualizados = usuarios.filter((usuario) => usuario.documento !== documento)

    guardarUsuarios(usuariosActualizados)
    setUsuarios(usuariosActualizados)

    if (documentoEnEdicion === documento) {
      limpiarFormulario()
    }

    if (usuarioSeleccionado?.validacion) {
      mostrarMensaje('El usuario activo fue eliminado y la sesion se cerrara.', 'mensaje-positivo')
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 900)
      return
    }

    mostrarMensaje('Usuario eliminado correctamente.', 'mensaje-positivo')
  }

  if (!esAdministrador(usuarioActivo)) {
    return (
      <main className="page-shell">
        <section className="content-section">
          <div className="users-card">
            <div className="section-heading">
              <span className="eyebrow">Acceso restringido</span>
              <h1>Solo el administrador puede gestionar usuarios</h1>
              <p>Inicia sesion con la cuenta administrativa para usar el CRUD de usuarios.</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Usuarios</span>
          <h1>Gestion de usuarios con localStorage</h1>
          <p>Solo la cuenta administradora puede crear, modificar y eliminar usuarios.</p>
        </div>

        <div className="card-grid thirds">
          <article className="metric-card">
            <h2>Usuarios registrados</h2>
            <p>Total almacenado en la base simulada del navegador</p>
            <strong>{usuarios.length}</strong>
          </article>

          <article className="metric-card">
            <h2>Sesion activa</h2>
            <p>Usuario autenticado actualmente</p>
            <strong>{usuarioActivo?.usuario ?? 'Sin sesion'}</strong>
          </article>

          <article className="metric-card">
            <h2>Rol activo</h2>
            <p>Permiso requerido para este modulo</p>
            <strong>Administrador</strong>
          </article>
        </div>
      </section>

      <section className="content-section users-layout">
        <article className="users-card">
          <div className="section-heading">
            <h2>{documentoEnEdicion ? 'Modificar usuario' : 'Crear usuario'}</h2>
            <p>Los nuevos registros se crean como clientes y se guardan en `localStorage`.</p>
          </div>

          <form className="form-grid" onSubmit={manejarGuardar}>
            <label>
              Nombre
              <input
                type="text"
                value={formulario.usuario}
                onChange={(event) => actualizarCampo('usuario', event.target.value)}
              />
            </label>

            <label>
              Documento
              <input
                type="text"
                value={formulario.documento}
                onChange={(event) => actualizarCampo('documento', event.target.value)}
              />
            </label>

            <label>
              Edad
              <input
                type="number"
                min={18}
                max={100}
                value={formulario.edad}
                onChange={(event) => actualizarCampo('edad', event.target.value)}
              />
            </label>

            <label>
              Correo electronico
              <input
                type="email"
                value={formulario.email}
                onChange={(event) => actualizarCampo('email', event.target.value)}
              />
            </label>

            <label>
              Contrasena
              <input
                type="password"
                value={formulario.password}
                onChange={(event) => actualizarCampo('password', event.target.value)}
              />
            </label>

            <div className="toolbar-row">
              <button type="submit" className="primary-button">
                {documentoEnEdicion ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              <button type="button" className="secondary-button" onClick={limpiarFormulario}>
                Limpiar
              </button>
            </div>

            <p className={tipoMensaje}>{mensaje}</p>
          </form>
        </article>

        <article className="users-card">
          <div className="section-heading">
            <h2>Listado de usuarios</h2>
            <p>El administrador quemado queda visible, pero no puede editarse ni eliminarse.</p>
          </div>

          <div className="table-shell">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Correo</th>
                  <th>Edad</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario) => (
                    <tr key={usuario.documento}>
                      <td>{usuario.usuario}</td>
                      <td>{usuario.documento}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.edad}</td>
                      <td>{usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}</td>
                      <td>
                        <span className={usuario.validacion ? 'status-badge' : 'status-badge idle'}>
                          {usuario.validacion ? 'Activa' : 'Registrado'}
                        </span>
                      </td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className="secondary-button small-button"
                          onClick={() => iniciarEdicion(usuario)}
                          disabled={usuario.rol === 'admin'}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="danger-button small-button"
                          onClick={() => eliminarUsuario(usuario.documento)}
                          disabled={usuario.rol === 'admin'}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No hay usuarios registrados todavia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  )
}
