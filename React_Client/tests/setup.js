import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ---- Canvas mock para jsdom ----
// Mock MUST be defined BEFORE any component imports
const noop = () => {}
const mockContext = {
  canvas: {},
  fillRect: noop,
  clearRect: noop,
  beginPath: noop,
  moveTo: noop,
  lineTo: noop,
  stroke: noop,
  arc: noop,
  fill: noop,
  strokeRect: noop,
  closePath: noop,
  save: noop,
  restore: noop,
  setTransform: noop,
  translate: noop,
  scale: noop,
  rotate: noop,
  transform: noop,
  drawImage: noop,
  fillText: noop,
  measureText: () => ({ width: 0 }),
  putImageData: noop,
  createLinearGradient: () => ({ addColorStop: noop }),
  createPattern: () => ({}),
  createRadialGradient: () => ({ addColorStop: noop }),
  getImageData: () => ({}),
  getLineDash: () => [],
  setLineDash: noop,
}

// Override getContext globally
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
