// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.VITE_API_BASE_URL = 'http://localhost:8080/api'
process.env.VITE_WEBSOCKET_URL = 'http://localhost:3001'
process.env.VITE_GOOGLE_CLIENT_ID = 'test-google-client-id'

// Mock WebSocket for tests
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url
    this.readyState = 1
    setTimeout(() => {
      if (this.onopen) this.onopen()
    }, 10)
  }

  send() {}
  close() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
