/**
 * Mock API service for testing without backend
 * Simulates the same interface as apiClient
 */

// Mock data store
const mockBlueprints = [
  {
    author: 'john',
    name: 'house',
    points: [
      { x: 10, y: 10 },
      { x: 100, y: 10 },
      { x: 100, y: 100 },
      { x: 10, y: 100 },
      { x: 10, y: 10 },
    ],
  },
  {
    author: 'john',
    name: 'kitchen',
    points: [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 150 },
      { x: 50, y: 150 },
      { x: 50, y: 50 },
    ],
  },
  {
    author: 'maria',
    name: 'office',
    points: [
      { x: 20, y: 20 },
      { x: 200, y: 20 },
      { x: 200, y: 150 },
      { x: 20, y: 150 },
      { x: 20, y: 20 },
    ],
  },
  {
    author: 'maria',
    name: 'garage',
    points: [
      { x: 30, y: 30 },
      { x: 180, y: 30 },
      { x: 180, y: 120 },
      { x: 30, y: 120 },
      { x: 30, y: 30 },
    ],
  },
  {
    author: 'peter',
    name: 'apartment',
    points: [
      { x: 15, y: 15 },
      { x: 250, y: 15 },
      { x: 250, y: 200 },
      { x: 15, y: 200 },
      { x: 15, y: 15 },
    ],
  },
  {
    author: 'jane',
    name: 'garden',
    points: [
      { x: 40, y: 40 },
      { x: 160, y: 40 },
      { x: 160, y: 140 },
      { x: 40, y: 140 },
      { x: 40, y: 40 },
    ],
  },
]

// Simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get all blueprints
 */
const getAll = async () => {
  await delay()
  return { data: [...mockBlueprints] }
}

/**
 * Get blueprints by author
 */
const getByAuthor = async (author) => {
  await delay()
  const filtered = mockBlueprints.filter((bp) => bp.author === author)
  return { data: filtered }
}

/**
 * Get a specific blueprint by author and name
 */
const getByAuthorAndName = async (author, name) => {
  await delay()
  const found = mockBlueprints.find((bp) => bp.author === author && bp.name === name)
  if (!found) {
    throw new Error(`Blueprint not found: ${author}/${name}`)
  }
  return { data: found }
}

/**
 * Create a new blueprint
 */
const create = async (blueprint) => {
  await delay()
  // Check if blueprint already exists
  const exists = mockBlueprints.some(
    (bp) => bp.author === blueprint.author && bp.name === blueprint.name,
  )
  if (exists) {
    throw new Error(`Blueprint already exists: ${blueprint.author}/${blueprint.name}`)
  }
  // Add to mock store
  mockBlueprints.push(blueprint)
  return { data: blueprint }
}

/**
 * Mock API client with the same interface as apiClient
 */
const apimock = {
  get: async (url) => {
    // Parse URL and route to appropriate function
    if (url === '/v1/blueprints') {
      return getAll()
    }
    // Match: /v1/blueprints/{author}
    const authorMatch = url.match(/^\/v1\/blueprints\/([^/]+)$/)
    if (authorMatch) {
      return getByAuthor(decodeURIComponent(authorMatch[1]))
    }
    // Match: /v1/blueprints/{author}/{name}
    const blueprintMatch = url.match(/^\/v1\/blueprints\/([^/]+)\/([^/]+)$/)
    if (blueprintMatch) {
      return getByAuthorAndName(
        decodeURIComponent(blueprintMatch[1]),
        decodeURIComponent(blueprintMatch[2]),
      )
    }
    throw new Error(`Unknown mock URL: ${url}`)
  },
  post: async (url, data) => {
    if (url === '/v1/blueprints') {
      return create(data)
    }
    // Mock login endpoint
    if (url === '/auth/login') {
      await delay(500)
      if (!data.username || !data.password) {
        throw new Error('Invalid credentials')
      }
      // Generate a fake JWT token
      const fakeToken = btoa(JSON.stringify({ username: data.username, exp: Date.now() + 86400000 }))
      return {
        data: {
          token: `mock.${fakeToken}.signature`,
          username: data.username,
          message: 'Login successful (mock)',
        },
      }
    }
    throw new Error(`Unknown mock URL: ${url}`)
  },
  put: async (url, data) => {
    // Match: /v1/blueprints/{author}/{name}
    const blueprintMatch = url.match(/^\/v1\/blueprints\/([^/]+)\/([^/]+)$/)
    if (blueprintMatch) {
      const author = decodeURIComponent(blueprintMatch[1])
      const name = decodeURIComponent(blueprintMatch[2])
      const found = mockBlueprints.find((bp) => bp.author === author && bp.name === name)
      if (!found) {
        throw new Error(`Blueprint not found: ${author}/${name}`)
      }
      // Update points
      found.points = data.points || []
      await delay()
      return { data: found }
    }
    throw new Error(`Unknown mock URL: ${url}`)
  },
  delete: async (url) => {
    // Match: /v1/blueprints/{author}/{name}
    const blueprintMatch = url.match(/^\/v1\/blueprints\/([^/]+)\/([^/]+)$/)
    if (blueprintMatch) {
      const author = decodeURIComponent(blueprintMatch[1])
      const name = decodeURIComponent(blueprintMatch[2])
      const index = mockBlueprints.findIndex((bp) => bp.author === author && bp.name === name)
      if (index === -1) {
        throw new Error(`Blueprint not found: ${author}/${name}`)
      }
      mockBlueprints.splice(index, 1)
      await delay()
      return { data: { success: true } }
    }
    throw new Error(`Unknown mock URL: ${url}`)
  },
}

export default apimock
