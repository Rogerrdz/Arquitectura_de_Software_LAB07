import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createBlueprint,
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  deleteBlueprint,
  selectTop5Blueprints,
} from '../features/blueprints/blueprintsSlice.js'
import InteractiveBlueprintCanvas from '../components/InteractiveBlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status, error } = useSelector((s) => s.blueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [newBlueprintName, setNewBlueprintName] = useState('')
  const items = byAuthor[selectedAuthor] || []
  const top5 = useSelector((state) => selectTop5Blueprints(state, selectedAuthor))

  useEffect(() => {
    dispatch(fetchAuthors())
  }, [dispatch])

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = () => {
    if (!authorInput) return
    setSelectedAuthor(authorInput)
    dispatch(fetchByAuthor(authorInput))
  }

  const handleRetry = () => {
    if (selectedAuthor) {
      dispatch(fetchByAuthor(selectedAuthor))
    }
  }

  const openBlueprint = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const handleDelete = (bp) => {
    if (confirm(`¿Eliminar el plano "${bp.name}"?`)) {
      dispatch(deleteBlueprint({ author: bp.author, name: bp.name }))
    }
  }

  const handleCreate = async () => {
    const author = (selectedAuthor || authorInput).trim()
    const name = newBlueprintName.trim()

    if (!author || !name) return

    try {
      const created = await dispatch(createBlueprint({ author, name, points: [] })).unwrap()
      setAuthorInput(created.author)
      setSelectedAuthor(created.author)
      setNewBlueprintName('')
      setEditMode(true)

      dispatch(fetchByAuthor(created.author))
      dispatch(fetchBlueprint({ author: created.author, name: created.name }))
    } catch (err) {
      const apiMessage = err?.message || err?.error || 'No fue posible crear el plano'
      alert(apiMessage)
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Planos</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="input"
              placeholder="Autor"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <button className="btn primary" onClick={getBlueprints}>
              Consultar planos
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <input
              className="input"
              placeholder="Nombre del nuevo plano"
              value={newBlueprintName}
              onChange={(e) => setNewBlueprintName(e.target.value)}
            />
            <button
              className="btn primary"
              onClick={handleCreate}
              disabled={!(selectedAuthor || authorInput) || !newBlueprintName.trim()}
            >
              Crear
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `Planos de ${selectedAuthor}:` : 'Resultados'}
          </h3>

          {error && status === 'failed' && (
            <div
              style={{
                padding: 12,
                marginBottom: 16,
                background: '#7f1d1d',
                border: '1px solid #dc2626',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Error: {error}</span>
              <button className="btn" onClick={handleRetry}>
                Reintentar
              </button>
            </div>
          )}

          {status === 'loading' && <p>Cargando...</p>}
          {!items.length && status !== 'loading' && status !== 'failed' && <p>Sin resultados.</p>}
          {!!items.length && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px',
                          borderBottom: '1px solid #334155',
                        }}
                      >
                        Nombre del plano
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '8px',
                          borderBottom: '1px solid #334155',
                        }}
                      >
                        Numero de puntos
                      </th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((bp) => (
                      <tr key={bp.name}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                          {bp.name}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            textAlign: 'right',
                            borderBottom: '1px solid #1f2937',
                          }}
                        >
                          {bp.points?.length || 0}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid #1f2937',
                            display: 'flex',
                            gap: 8,
                          }}
                        >
                          <button className="btn" onClick={() => openBlueprint(bp)}>
                            Abrir
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleDelete(bp)}
                            style={{ background: '#7f1d1d', borderColor: '#dc2626' }}
                          >
                            Eliminar
                          </button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
          )}
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total de puntos del autor: {totalPoints}</p>
          
          {top5.length > 0 && (
            <div style={{ marginTop: 16, padding: 12, background: '#1f2937', borderRadius: 8 }}>
              <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 14, color: '#fbbf24' }}>
                Top 5 planos (por cantidad de puntos)
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                {top5.map((bp, idx) => (
                  <li key={bp.name}>
                    #{idx + 1}. {bp.name} ({bp.points?.length || 0} puntos)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0 }}>Plano actual: {current?.name || '—'}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {current && (
              <button className="btn primary" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Editando' : 'Editar'}
              </button>
            )}
          </div>
        </div>
        <InteractiveBlueprintCanvas blueprint={current} editable={editMode} />
      </section>
    </div>
  )
}
