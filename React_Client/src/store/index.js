import { configureStore } from '@reduxjs/toolkit'
import blueprintsReducer from '../features/blueprints/blueprintsSlice.js'
import authReducer from '../features/auth/authSlice.js'

const store = configureStore({
  reducer: {
    blueprints: blueprintsReducer,
    auth: authReducer,
  },
})

export default store
