/**
 * Blueprint Service - Switch between mock and real API
 * 
 * Change the service implementation by setting VITE_USE_MOCK in .env:
 * - VITE_USE_MOCK=true  → uses apimock (local data)
 * - VITE_USE_MOCK=false → uses apiClient (real backend)
 * 
 * This allows testing the frontend without running the backend.
 */

import apiClient from './apiClient.js'
import apimock from './apimock.js'

// Read environment variable
const useMock = import.meta.env.VITE_USE_MOCK === 'true'

// Select service based on environment
const blueprintsService = useMock ? apimock : apiClient

// Log which service is being used
console.log(`[BlueprintsService] Using ${useMock ? 'MOCK' : 'REAL API'} service`)

export default blueprintsService
