import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'
import api from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const { data } = await api.get('/v1/blueprints')
  // API returns ApiResponse wrapper: { code, message, data: [...] }
  const blueprints = data.data || data
  const authors = [...new Set(blueprints.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const { data } = await api.get(`/v1/blueprints/${encodeURIComponent(author)}`)
  // API returns ApiResponse wrapper: { code, message, data: [...] }
  const items = data.data || data
  return { author, items }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    const { data } = await api.get(
      `/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    // API returns ApiResponse wrapper: { code, message, data: {...} }
    return data.data || data
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  const { data } = await api.post('/v1/blueprints', payload)
  // API returns ApiResponse wrapper: { code, message, data: {...} }
  return data.data || data
})

export const updateBlueprint = createAsyncThunk(
  'blueprints/updateBlueprint',
  async ({ author, name, points }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
        { points },
      )
      // API returns ApiResponse wrapper: { code, message, data: {...} }
      const blueprint = data.data || data
      return { author, name, blueprint }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Update failed')
    }
  },
)

export const deleteBlueprint = createAsyncThunk(
  'blueprints/deleteBlueprint',
  async ({ author, name }, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`)
      return { author, name }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Delete failed')
    }
  },
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    applyRealtimeBlueprint: (state, action) => {
      const { author, name, points } = action.payload || {}
      if (!author || !name || !Array.isArray(points)) return

      if (state.byAuthor[author]) {
        const idx = state.byAuthor[author].findIndex((bp) => bp.name === name)
        if (idx !== -1) {
          state.byAuthor[author][idx] = {
            ...state.byAuthor[author][idx],
            points,
          }
        }
      }

      if (state.current?.author === author && state.current?.name === name) {
        state.current = { ...state.current, points }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchByAuthor.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.byAuthor[a.payload.author] = a.payload.items
        s.error = null
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.current = a.payload
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
      })
      // Optimistic update for updateBlueprint
      .addCase(updateBlueprint.pending, (s, a) => {
        const { author, name, points } = a.meta.arg
        if (s.byAuthor[author]) {
          const idx = s.byAuthor[author].findIndex((bp) => bp.name === name)
          if (idx !== -1) {
            s.byAuthor[author][idx] = { ...s.byAuthor[author][idx], points }
          }
        }
        if (s.current?.author === author && s.current?.name === name) {
          s.current = { ...s.current, points }
        }
      })
      .addCase(updateBlueprint.fulfilled, (s, a) => {
        // Already optimistically updated, confirmation received
        s.error = null
      })
      .addCase(updateBlueprint.rejected, (s, a) => {
        // Rollback - refetch is recommended
        s.error = 'Update failed, please refresh'
      })
      // Optimistic delete
      .addCase(deleteBlueprint.pending, (s, a) => {
        const { author, name } = a.meta.arg
        if (s.byAuthor[author]) {
          s.byAuthor[author] = s.byAuthor[author].filter((bp) => bp.name !== name)
        }
        if (s.current?.author === author && s.current?.name === name) {
          s.current = null
        }
      })
      .addCase(deleteBlueprint.fulfilled, (s) => {
        s.error = null
      })
      .addCase(deleteBlueprint.rejected, (s, a) => {
        s.error = 'Delete failed, please refresh'
      })
  },
})

// Memoized selector for top-5 blueprints by number of points
export const selectTop5Blueprints = createSelector(
  [(state) => state.blueprints.byAuthor, (_, author) => author],
  (byAuthor, author) => {
    if (!author || !byAuthor[author]) return []
    return [...byAuthor[author]]
      .sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0))
      .slice(0, 5)
  },
)

export const { applyRealtimeBlueprint } = slice.actions

export default slice.reducer
