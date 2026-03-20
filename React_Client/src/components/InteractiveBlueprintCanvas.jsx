import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { applyRealtimeBlueprint, updateBlueprint } from '../features/blueprints/blueprintsSlice.js'
import { createStompClient, subscribeBlueprint } from '../lib/stompClient.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'
const INFERRED_BACKEND_BASE = API_BASE_URL.replace(/\/api(?:\/v1)?\/?$/, '')
const STOMP_BASE = import.meta.env.VITE_STOMP_BASE || INFERRED_BACKEND_BASE

export default function InteractiveBlueprintCanvas({
  blueprint,
  width = 520,
  height = 360,
  editable = false,
}) {
  const ref = useRef(null)
  const [points, setPoints] = useState(blueprint?.points || [])
  const [hasChanges, setHasChanges] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('desconectado')

  const stompClientRef = useRef(null)
  const stompUnsubscribeRef = useRef(null)

  const dispatch = useDispatch()

  const teardownRealtime = () => {
    stompUnsubscribeRef.current?.unsubscribe?.()
    stompUnsubscribeRef.current = null
    stompClientRef.current?.deactivate?.()
    stompClientRef.current = null
  }

  useEffect(() => {
    if (blueprint?.points) {
      setPoints(blueprint.points)
      setHasChanges(false)
    }
  }, [blueprint])

  useEffect(() => {
    teardownRealtime()

    if (!blueprint) {
      setConnectionStatus('desconectado')
      return () => {
        teardownRealtime()
      }
    }

    const { author, name } = blueprint

    setConnectionStatus('conectando')
    const client = createStompClient(STOMP_BASE)
    stompClientRef.current = client

    client.onConnect = () => {
      setConnectionStatus('conectado')
      stompUnsubscribeRef.current = subscribeBlueprint(client, author, name, (update) => {
        if (!Array.isArray(update?.points)) return

        const nextAuthor = update.author || author
        const nextName = update.name || name

        setPoints(update.points)
        setHasChanges(false)
        dispatch(
          applyRealtimeBlueprint({
            author: nextAuthor,
            name: nextName,
            points: update.points,
          }),
        )
      })
    }

    client.onWebSocketError = () => {
      setConnectionStatus('error')
    }

    client.onStompError = () => {
      setConnectionStatus('error')
    }

    client.activate()

    return () => {
      teardownRealtime()
    }
  }, [blueprint, dispatch])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    
    // Draw lines
    if (points.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const p = points[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
    
    // Draw points
    ctx.fillStyle = '#fbbf24'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  const handleCanvasClick = (e) => {
    if (!editable || !blueprint) return
    
    const canvas = ref.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)

    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/draw',
        body: JSON.stringify({
          author: blueprint.author,
          name: blueprint.name,
          point: { x, y },
        }),
      })
      return
    }

    setPoints((prev) => [...prev, { x, y }])
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!blueprint || !hasChanges) return
    
    dispatch(
      updateBlueprint({
        author: blueprint.author,
        name: blueprint.name,
        points,
      }),
    )
    dispatch(
      applyRealtimeBlueprint({
        author: blueprint.author,
        name: blueprint.name,
        points,
      }),
    )
    setHasChanges(false)
  }

  const handleReset = () => {
    setPoints(blueprint?.points || [])
    setHasChanges(false)
  }

  return (
    <div>
      <canvas
        ref={ref}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        style={{
          background: '#0b1220',
          border: editable ? '2px solid #3b82f6' : '1px solid #334155',
          borderRadius: 12,
          width: '100%',
          maxWidth: width,
          cursor: editable ? 'crosshair' : 'default',
        }}
      />
      {blueprint && (
        <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: '#93c5fd' }}>
          STOMP: {connectionStatus}
        </p>
      )}
      {editable && blueprint && (
        <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={!hasChanges}
            style={{ opacity: hasChanges ? 1 : 0.5 }}
          >
            Guardar/Actualizar ({points.length} puntos)
          </button>
          <button className="btn" onClick={handleReset} disabled={!hasChanges}>
            ↺ Restablecer
          </button>
        </div>
      )}
    </div>
  )
}
