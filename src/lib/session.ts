export type RolUsuario = 'admin' | 'cliente'

export type Usuario = {
  usuario: string
  documento: string
  edad: string
  email: string
  password: string
  rol?: RolUsuario
  validacion?: boolean
}

export const USERS_KEY = 'usuarios'
export const USERS_UPDATED_EVENT = 'usuarios:updated'
export const ADMIN_EMAIL = 'admin@sotostransport.com'
export const ADMIN_PASSWORD = 'AdminSoto2026!'
export const ADMIN_NAME = 'Administrador Soto'
export const ADMIN_DOCUMENT = '1000000000'

const ADMIN_USER: Usuario = {
  usuario: ADMIN_NAME,
  documento: ADMIN_DOCUMENT,
  edad: '30',
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  rol: 'admin',
  validacion: false,
}

export function inicializarUsuarios(): void {
  const rawValue = localStorage.getItem(USERS_KEY)
  const usuariosBase = rawValue ? parsearUsuarios(rawValue) : []
  const { usuarios, cambio } = normalizarUsuarios(usuariosBase)

  if (!rawValue || cambio) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios))
  }
}

export function obtenerUsuarios(): Usuario[] {
  const rawValue = localStorage.getItem(USERS_KEY)

  if (!rawValue) {
    return [ADMIN_USER]
  }

  return normalizarUsuarios(parsearUsuarios(rawValue)).usuarios
}

export function guardarUsuarios(usuarios: Usuario[]): void {
  const usuariosNormalizados = normalizarUsuarios(usuarios).usuarios
  localStorage.setItem(USERS_KEY, JSON.stringify(usuariosNormalizados))

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(USERS_UPDATED_EVENT))
  }
}

export function obtenerUsuarioActivo(): Usuario | null {
  return obtenerUsuarios().find((usuario) => usuario.validacion === true) ?? null
}

export function haySesionActiva(): boolean {
  return obtenerUsuarioActivo() !== null
}

export function iniciarSesion(email: string, password: string): Usuario | null {
  const emailNormalizado = email.trim().toLowerCase()
  const usuarios = obtenerUsuarios()
  const usuarioEncontrado =
    usuarios.find(
      (usuario) => usuario.email.toLowerCase() === emailNormalizado && usuario.password === password
    ) ?? null

  if (!usuarioEncontrado) {
    return null
  }

  const usuariosActualizados = usuarios.map((usuario) => ({
    ...usuario,
    validacion: usuario.email.toLowerCase() === usuarioEncontrado.email.toLowerCase(),
  }))

  guardarUsuarios(usuariosActualizados)

  return (
    usuariosActualizados.find(
      (usuario) => usuario.email.toLowerCase() === usuarioEncontrado.email.toLowerCase()
    ) ?? null
  )
}

export function cerrarSesion(): void {
  const usuariosActualizados = obtenerUsuarios().map((usuario) => ({
    ...usuario,
    validacion: false,
  }))

  guardarUsuarios(usuariosActualizados)
}

export function esAdministrador(usuario: Usuario | null | undefined): boolean {
  return usuario?.rol === 'admin'
}

function parsearUsuarios(rawValue: string): Usuario[] {
  try {
    return JSON.parse(rawValue) as Usuario[]
  } catch {
    return []
  }
}

function normalizarUsuarios(usuarios: Usuario[]): { usuarios: Usuario[]; cambio: boolean } {
  let cambio = false
  const adminGuardado = usuarios.find((usuario) => usuario.email.toLowerCase() === ADMIN_EMAIL)
  const adminNormalizado: Usuario = {
    ...ADMIN_USER,
    validacion: adminGuardado?.validacion === true,
  }

  const clientes = usuarios
    .filter((usuario) => usuario.email.toLowerCase() !== ADMIN_EMAIL)
    .map((usuario) => {
      const rol: RolUsuario = 'cliente'

      if (usuario.rol !== rol) {
        cambio = true
      }

      return {
        ...usuario,
        rol,
      }
    })

  if (!adminGuardado) {
    cambio = true
  }

  if (
    !adminGuardado ||
    adminGuardado.password !== ADMIN_PASSWORD ||
    adminGuardado.usuario !== ADMIN_NAME ||
    adminGuardado.documento !== ADMIN_DOCUMENT ||
    adminGuardado.rol !== 'admin'
  ) {
    cambio = true
  }

  return {
    usuarios: [adminNormalizado, ...clientes],
    cambio,
  }
}
