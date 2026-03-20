import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../features/auth/authSlice.js'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api').replace(
  /\/$/,
  '',
)

function buildLoginApiCandidates() {
  const candidates = []
  const addCandidate = (value) => {
    if (!value) return
    const normalized = value.replace(/\/$/, '')
    if (!candidates.includes(normalized)) {
      candidates.push(normalized)
    }
  }

  addCandidate(API_BASE_URL)

  try {
    const parsed = new URL(API_BASE_URL)
    const apiPath = parsed.pathname ? parsed.pathname.replace(/\/$/, '') : '/api'
    ;[8082, 8081, 8080].forEach((port) => {
      addCandidate(`${parsed.protocol}//${parsed.hostname}:${port}${apiPath}`)
    })
  } catch {
    // Keep configured candidate only if URL parsing fails.
  }

  return candidates
}

async function requestLogin(username, password) {
  const body = JSON.stringify({ username, password })
  const candidates = buildLoginApiCandidates()
  let lastError = null

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })

      if (!response.ok) {
        const responseText = await response.text()
        const err = new Error(`HTTP ${response.status}`)
        err.status = response.status
        err.responseText = responseText
        throw err
      }

      const data = await response.json()
      return { data, baseUrl }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('No se pudo iniciar sesion en ninguno de los endpoints configurados')
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [usedEndpoint, setUsedEndpoint] = useState(null)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  // Si ya está autenticado, redirigir a blueprints
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/blueprints', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const normalizedUsername = username.trim()
    const normalizedPassword = password.trim()

    if (!normalizedUsername || !normalizedPassword) {
      setError('Usuario y contraseña son obligatorios')
      return
    }

    try {
      const { data, baseUrl } = await requestLogin(normalizedUsername, normalizedPassword)
      
      // Guardar en Redux (que también guarda en localStorage)
      dispatch(login({ token: data.token, username: normalizedUsername }))
      setUsedEndpoint(baseUrl)
      
      setSuccess(true)
      
      // Redirigir a blueprints después de un breve delay
      setTimeout(() => {
        navigate('/blueprints', { replace: true })
      }, 1000)
    } catch (e) {
      const status = e?.status
      const apiMessage = e?.responseText
      const fallback = 'Credenciales inválidas o servidor no disponible'
      const detail = apiMessage || (status ? `Error ${status}` : null)
      setError(detail ? `${fallback} (${detail})` : fallback)
      console.error('[InicioSesion] Error en solicitud', e)
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Iniciar sesion</h2>
      <div className="grid cols-2">
        <div>
          <label>Usuario</label>
          <input 
            className="input" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {success && <p style={{ color: '#4ade80' }}>Inicio de sesion exitoso. Redirigiendo...</p>}
      {usedEndpoint && (
        <p style={{ marginTop: 6, color: '#93c5fd', fontSize: 12 }}>
          Endpoint usado: {usedEndpoint}/auth/login
        </p>
      )}
      <button className="btn primary" style={{ marginTop: 12 }}>
        Ingresar
      </button>
    </form>
  )
}
