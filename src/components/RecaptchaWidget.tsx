import { useEffect, useId, useRef, useState } from 'react'

const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-script'
const RECAPTCHA_SITEKEY = import.meta.env.VITE_RECAPTCHA_SITEKEY || ''
const RECAPTCHA_SOURCES = [
  'https://www.google.com/recaptcha/api.js?render=explicit',
  'https://www.recaptcha.net/recaptcha/api.js?render=explicit',
]

let scriptPromise: Promise<void> | null = null

async function esperarRecaptchaDisponible(timeoutMs = 5000): Promise<GrecaptchaApi> {
  const inicio = Date.now()

  while (Date.now() - inicio < timeoutMs) {
    if (window.grecaptcha?.render) {
      return window.grecaptcha
    }

    await new Promise((resolve) => setTimeout(resolve, 120))
  }

  throw new Error('reCAPTCHA cargo el script, pero la API no quedo lista a tiempo.')
}

function cargarScriptRecaptcha(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.grecaptcha) {
    return Promise.resolve()
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const scriptExistente = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null

    if (scriptExistente) {
      if (window.grecaptcha) {
        resolve()
        return
      }

      scriptExistente.addEventListener('load', () => resolve(), { once: true })
      scriptExistente.addEventListener('error', () => reject(new Error('No se pudo cargar reCAPTCHA.')), {
        once: true,
      })
      return
    }

    const intentarCarga = (index: number) => {
      if (index >= RECAPTCHA_SOURCES.length) {
        reject(new Error('No se pudo cargar reCAPTCHA desde Google ni desde recaptcha.net.'))
        return
      }

      const script = document.createElement('script')
      script.id = RECAPTCHA_SCRIPT_ID
      script.src = RECAPTCHA_SOURCES[index]
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => {
        script.remove()
        intentarCarga(index + 1)
      }
      document.head.appendChild(script)
    }

    intentarCarga(0)
  })

  return scriptPromise
}

type RecaptchaWidgetProps = {
  onTokenChange: (token: string | null) => void
}

export default function RecaptchaWidget({ onTokenChange }: RecaptchaWidgetProps) {
  const uniqueId = useId()
  const containerId = `recaptcha-${uniqueId.replace(/:/g, '')}`
  const widgetIdRef = useRef<number | null>(null)
  const [estado, setEstado] = useState('Cargando reCAPTCHA...')

  useEffect(() => {
    let activo = true

    if (!RECAPTCHA_SITEKEY) {
      setEstado('Configura VITE_RECAPTCHA_SITEKEY para usar la API real.')
      onTokenChange(null)
      return
    }

    cargarScriptRecaptcha()
      .then(async () => {
        if (!activo) {
          return
        }

        const grecaptcha = await esperarRecaptchaDisponible()

        const renderizar = () => {
          if (!activo) {
            return
          }

          widgetIdRef.current = grecaptcha.render(containerId, {
            sitekey: RECAPTCHA_SITEKEY,
            theme: 'light',
            callback: (token) => {
              onTokenChange(token)
              setEstado('Verificacion completada.')
            },
            'expired-callback': () => {
              onTokenChange(null)
              setEstado('La verificacion expiro. Vuelve a marcarla.')
            },
            'error-callback': () => {
              onTokenChange(null)
              setEstado('Error cargando reCAPTCHA.')
            },
          })

          setEstado('Marca la casilla para continuar.')
        }

        if (grecaptcha.ready) {
          grecaptcha.ready(renderizar)
          return
        }

        renderizar()
      })
      .catch(() => {
        if (!activo) {
          return
        }

        onTokenChange(null)
        setEstado('No fue posible cargar Google reCAPTCHA.')
      })

    return () => {
      activo = false
    }
  }, [containerId, onTokenChange])

  return (
    <div className="captcha-block">
      <p className="captcha-label">Verificacion humana</p>
      <div id={containerId} className="captcha-container" />
      <p className="captcha-note">{estado}</p>
    </div>
  )
}
