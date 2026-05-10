import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = Number(process.env.API_PORT || 3001)
const ENV_FILE = resolve(process.cwd(), '.env')
const RECAPTCHA_VERIFY_ENDPOINTS = [
  'https://www.google.com/recaptcha/api/siteverify',
  'https://www.recaptcha.net/recaptcha/api/siteverify',
]

cargarArchivoEnv(ENV_FILE)

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || ''

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    return responderJson(response, 204, {})
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return responderJson(response, 200, { ok: true, service: 'recaptcha-api' })
  }

  if (request.method === 'POST' && url.pathname === '/api/recaptcha/verify') {
    try {
      const body = await leerJson(request)
      const token = typeof body.token === 'string' ? body.token.trim() : ''

      if (!token) {
        return responderJson(response, 400, {
          ok: false,
          message: 'Falta el token de reCAPTCHA.',
        })
      }

      if (!RECAPTCHA_SECRET_KEY) {
        return responderJson(response, 500, {
          ok: false,
          message: 'Configura RECAPTCHA_SECRET_KEY en el servidor.',
        })
      }

      const resultado = await validarRecaptcha({
        token,
        remoteIp: request.socket.remoteAddress || undefined,
      })

      if (!resultado.success) {
        return responderJson(response, 400, {
          ok: false,
          message: 'reCAPTCHA rechazo la verificacion.',
          errors: resultado['error-codes'] || [],
        })
      }

      return responderJson(response, 200, {
        ok: true,
        message: 'reCAPTCHA validado correctamente.',
        hostname: resultado.hostname ?? null,
        challengeTs: resultado.challenge_ts ?? null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'

      return responderJson(response, 500, {
        ok: false,
        message,
      })
    }
  }

  responderJson(response, 404, { ok: false, message: 'Ruta no encontrada.' })
})

server.listen(PORT, () => {
  console.log(`reCAPTCHA API escuchando en http://127.0.0.1:${PORT}`)
})

async function validarRecaptcha({ token, remoteIp }) {
  const payload = new URLSearchParams({
    secret: RECAPTCHA_SECRET_KEY,
    response: token,
  })

  if (remoteIp) {
    payload.set('remoteip', remoteIp)
  }

  let ultimoError = null

  for (const endpoint of RECAPTCHA_VERIFY_ENDPOINTS) {
    try {
      const recaptchaResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
        signal: AbortSignal.timeout(8000),
      })

      if (!recaptchaResponse.ok) {
        throw new Error(`Proveedor respondio con estado ${recaptchaResponse.status}.`)
      }

      return recaptchaResponse.json()
    } catch (error) {
      ultimoError = error
    }
  }

  const mensaje =
    ultimoError instanceof Error
      ? ultimoError.message
      : 'No fue posible conectar con los endpoints de verificacion de reCAPTCHA.'

  throw new Error(mensaje)
}

async function leerJson(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  const rawBody = Buffer.concat(chunks).toString('utf8')

  if (!rawBody) {
    return {}
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    throw new Error('El cuerpo de la solicitud no es JSON valido.')
  }
}

function responderJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  })
  response.end(JSON.stringify(payload))
}

function cargarArchivoEnv(filePath) {
  if (!existsSync(filePath)) {
    return
  }

  const contenido = readFileSync(filePath, 'utf8')
  const lineas = contenido.split(/\r?\n/)

  for (const linea of lineas) {
    const limpia = linea.trim()

    if (!limpia || limpia.startsWith('#')) {
      continue
    }

    const separador = limpia.indexOf('=')

    if (separador === -1) {
      continue
    }

    const clave = limpia.slice(0, separador).trim()
    const valor = limpia.slice(separador + 1).trim().replace(/^['"]|['"]$/g, '')

    if (clave && process.env[clave] === undefined) {
      process.env[clave] = valor
    }
  }
}
