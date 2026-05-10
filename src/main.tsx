import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import FooterDemo from './components/FooterDemo'
import { inicializarUsuarios } from './lib/session'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontro el elemento root')
}

inicializarUsuarios()

createRoot(rootElement).render(
  <StrictMode>
    <div className="react-shell">
      <div className="react-view">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </div>
      <FooterDemo />
    </div>
  </StrictMode>
)
