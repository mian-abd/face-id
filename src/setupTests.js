// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock TensorFlow.js for testing
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn(() => Promise.resolve()),
  loadLayersModel: jest.fn(() => Promise.resolve({
    predict: jest.fn(() => ({ data: () => Promise.resolve([0.8]) }))
  })),
  browser: {
    fromPixels: jest.fn(() => ({
      div: jest.fn(() => ({
        expandDims: jest.fn(() => ({
          dispose: jest.fn()
        })),
        dispose: jest.fn()
      })),
      dispose: jest.fn()
    }))
  },
  image: {
    resizeBilinear: jest.fn((tensor) => tensor)
  },
  tidy: jest.fn((fn) => fn()),
  dispose: jest.fn(),
  memory: jest.fn(() => ({
    numTensors: 0,
    numDataBuffers: 0,
    numBytes: 0
  }))
}));

// Mock Webcam component
jest.mock('react-webcam', () => {
  return function MockWebcam({ onUserMedia, ...props }) {
    return <div data-testid="mock-webcam" {...props} />;
  };
});

// Mock Framer Motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    img: 'img',
    span: 'span'
  },
  AnimatePresence: ({ children }) => children
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock canvas for image processing tests
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4)
  })),
  putImageData: jest.fn(),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
}));

// Mock HTMLMediaElement
Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  writable: true,
  value: false,
});

// Global test utilities
global.testUtils = {
  // Helper to create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    username: 'TestUser',
    email: 'test@example.com',
    modelTrained: false,
    ...overrides
  }),

  // Helper to create mock image data
  createMockImageData: () => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+hxRsTnIgOoSDmUPzYjuTivtPseBvPRHrWaYFfSaSITJGXjQIhHQZOQADaUaSDYVUi6dFz2dmqfcbOb9JsGPsZrUy0vdAFRUTOjuWHm9qT6zOcNyJhYFcnkOWVcJLhttjTJlV2UZZwMcZjcpZ+hZ6W7vRrFPfK4bINNwvKNgkzWc6aHPLz85N9gAyOjJwG+gCNv3wMD/eSXmOo9VJgwVX',

  // Helper to wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to simulate user interactions
  simulateUserInteraction: {
    click: (element) => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    },
    keyDown: (element, key) => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    },
    change: (element, value) => {
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
};

// Suppress console warnings during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: validateDOMNesting'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});
