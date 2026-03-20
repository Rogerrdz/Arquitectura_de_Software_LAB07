import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  user: localStorage.getItem('username') || null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token
      state.isAuthenticated = true
      state.user = action.payload.username
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('username', action.payload.username)
    },
    logout: (state) => {
      state.token = null
      state.isAuthenticated = false
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
