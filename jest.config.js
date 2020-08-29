module.exports = {
  testEnvironment: 'node',
  roots: ['__tests__'],
  resetModules: true,
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ['text'],
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
}
