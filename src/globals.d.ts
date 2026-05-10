declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

type RecaptchaRenderOptions = {
  sitekey: string
  theme?: 'light' | 'dark'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

type GrecaptchaApi = {
  ready?: (callback: () => void) => void
  render: (container: string | HTMLElement, options: RecaptchaRenderOptions) => number
  reset: (widgetId?: number) => void
  getResponse: (widgetId?: number) => string
}

interface Window {
  grecaptcha?: GrecaptchaApi
}
