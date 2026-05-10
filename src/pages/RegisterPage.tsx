import { type FormEvent, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecaptchaWidget from '../components/RecaptchaWidget'
import { guardarUsuarios, obtenerUsuarios, type Usuario } from '../lib/session'

const CAPTCHA_HABILITADO = Boolean(import.meta.env.VITE_RECAPTCHA_SITEKEY)

export default function RegisterPage() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [documento, setDocumento] = useState('')
  const [edad, setEdad] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState<'mensaje-positivo' | 'mensaje-negativo' | ''>('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaVersion, setCaptchaVersion] = useState(0)
  const [enviando, setEnviando] = useState(false)

  const manejarTokenCaptcha = useCallback((token: string | null) => {
    setCaptchaToken(token)
  }, [])

  const mostrarMensaje = (texto: string, tipo: 'mensaje-positivo' | 'mensaje-negativo') => {
    setMensaje(texto)
    setTipoMensaje(tipo)
  }

  const reiniciarCaptcha = () => {
    setCaptchaToken(null)
    setCaptchaVersion((valorActual) => valorActual + 1)
  }

  const manejarRegistro = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nombreNormalizado = usuario.trim().replace(/\s+/g, ' ')
    const documentoNormalizado = documento.trim()
    const edadNumero = Number(edad)
    const emailNormalizado = email.trim().toLowerCase()
    const validacion = false

    const lista: Usuario[] = obtenerUsuarios()
    const documentoExiste = lista.some((item) => item.documento === documentoNormalizado)
    const correoExiste = lista.some((item) => item.email.toLowerCase() === emailNormalizado)
    const nombreValido = /^[A-Za-z ]{3,40}$/.test(nombreNormalizado)
    const documentoValido = /^\d{6,12}$/.test(documentoNormalizado)
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailNormalizado)
    const passwordValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,24}$/.test(
      password
    )

    if (
      !nombreNormalizado ||
      !documentoNormalizado ||
      Number.isNaN(edadNumero) ||
      !emailNormalizado ||
      !password ||
      !confirmPassword
    ) {
      mostrarMensaje('Todos los campos son obligatorios.', 'mensaje-negativo')
      return
    }

    if (!nombreValido) {
      mostrarMensaje(
        'El nombre debe tener entre 3 y 40 letras y solo puede contener letras y espacios.',
        'mensaje-negativo'
      )
      return
    }

    if (!documentoValido) {
      mostrarMensaje('El documento debe tener entre 6 y 12 digitos numericos.', 'mensaje-negativo')
      return
    }

    if (!Number.isInteger(edadNumero) || edadNumero < 18 || edadNumero > 100) {
      mostrarMensaje('La edad debe ser un numero entero entre 18 y 100 anos.', 'mensaje-negativo')
      return
    }

    if (!emailValido) {
      mostrarMensaje('Ingresa un correo electronico valido.', 'mensaje-negativo')
      return
    }

    if (!passwordValida) {
      mostrarMensaje(
        'La contrasena debe tener 8 a 24 caracteres, mayuscula, minuscula, numero y simbolo.',
        'mensaje-negativo'
      )
      return
    }

    if (password !== confirmPassword) {
      mostrarMensaje('La confirmacion de la contrasena no coincide.', 'mensaje-negativo')
      return
    }

    if (correoExiste) {
      mostrarMensaje('Ese correo electronico ya esta en uso.', 'mensaje-negativo')
      return
    }

    if (documentoExiste) {
      mostrarMensaje('Ese documento ya esta registrado.', 'mensaje-negativo')
      return
    }

    if (CAPTCHA_HABILITADO && !captchaToken) {
      mostrarMensaje('Completa la verificacion de Google reCAPTCHA.', 'mensaje-negativo')
      return
    }

    setEnviando(true)

    let mensajeCaptcha = ''

    try {
      if (CAPTCHA_HABILITADO && captchaToken) {
        const response = await fetch('/api/recaptcha/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: captchaToken,
          }),
        })

        const resultado = (await response.json()) as {
          ok: boolean
          message?: string
          errors?: string[]
        }

        if (!response.ok || !resultado.ok) {
          mostrarMensaje(
            resultado.message || 'No fue posible validar Google reCAPTCHA.',
            'mensaje-negativo'
          )
          reiniciarCaptcha()
          return
        }
      }
    } catch {
      mensajeCaptcha = ' Registro completado en modo local porque la validacion remota no estuvo disponible.'
    } finally {
      setEnviando(false)
    }

    lista.push({
      usuario: nombreNormalizado,
      documento: documentoNormalizado,
      edad: String(edadNumero),
      email: emailNormalizado,
      password,
      rol: 'cliente',
      validacion,
    })

    guardarUsuarios(lista)
    mostrarMensaje(`Usuario registrado correctamente.${mensajeCaptcha}`, 'mensaje-positivo')
    setUsuario('')
    setDocumento('')
    setEdad('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    reiniciarCaptcha()
  }

  return (
    <main className="login-container">
      <div className="login-box">
        <h1>Registrate</h1>
        <form id="FormularioRegistro" onSubmit={manejarRegistro}>
          <div className="campo">
            <label htmlFor="usuario">Nombre</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              required
              minLength={3}
              maxLength={40}
              pattern="[A-Za-z ]{3,40}"
              title="Ingresa entre 3 y 40 letras. Solo se permiten letras y espacios."
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="documento">Documento</label>
            <input
              type="text"
              id="documento"
              name="documento"
              required
              inputMode="numeric"
              minLength={6}
              maxLength={12}
              pattern="[0-9]{6,12}"
              title="El documento debe tener entre 6 y 12 digitos numericos."
              value={documento}
              onChange={(event) => setDocumento(event.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="edad">Edad</label>
            <input
              type="number"
              id="edad"
              name="edad"
              required
              min={18}
              max={100}
              value={edad}
              onChange={(event) => setEdad(event.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="email">Correo electronico</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              maxLength={80}
              title="Ingresa un correo valido, por ejemplo usuario@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="password">Contrasena</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              maxLength={24}
              title="Minimo 8 caracteres con mayuscula, minuscula, numero y simbolo."
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              maxLength={24}
              title="Debe coincidir exactamente con la contrasena."
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {CAPTCHA_HABILITADO ? (
            <RecaptchaWidget key={captchaVersion} onTokenChange={manejarTokenCaptcha} />
          ) : (
            <div className="captcha-block">
              <p className="captcha-label">Verificacion humana</p>
              <p className="captcha-note">
                La aplicacion esta en modo local y permite registrar usuarios sin reCAPTCHA.
              </p>
            </div>
          )}

          <button type="submit" id="btnLogin" disabled={enviando}>
            {enviando ? 'Validando...' : 'Registrate'}
          </button>

          <div className="registro">
            <span>Ya tienes cuenta?</span>{' '}
            <button type="button" id="btnRegistrar" onClick={() => navigate('/')}>
              Inicia sesion
            </button>
          </div>

          <div id="mensajeRegistro" className={tipoMensaje}>
            {mensaje}
          </div>
        </form>
      </div>
    </main>
  )
}
