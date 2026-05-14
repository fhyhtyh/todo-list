module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        useESM: true,
        tsconfig: {
          verbatimModuleSyntax: false,
          jsx: 'react-jsx',
          esModuleInterop: true,
        },
        diagnostics: {
          warnOnly: true
        }
      }
    ]
  },
  transformIgnorePatterns: ['/node_modules/']
};