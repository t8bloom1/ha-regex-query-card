// Jest setup file for Home Assistant custom card testing

// Mock Home Assistant globals
(global as any).customElements = {
  define: jest.fn(),
  get: jest.fn(),
};

// Mock window.customCards for Home Assistant card registration
(global as any).window = {
  customCards: [],
};

// Mock console methods to reduce test noise
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};