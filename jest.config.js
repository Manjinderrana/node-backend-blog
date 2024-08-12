export const preset = 'ts-jest'
export const testEnvironment = 'node'
export const coverageDirectory = 'coverage'
export const collectCoverageFrom = ['src/**/*.{js,ts}']
export const transform = {
  '^.+\\.tsx?$': 'ts-jest',
}
export const moduleNameMapper = { 'src/(.*)': '<rootDir>/src/$1' }
export const moduleDirectories = ['node_modules', 'src']
export const coverageThreshold = {
  global: {
    branches: 0,
    functions: 0,
    lines: 0,
    statements: 0,
  },
}
export const testRegex = '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$'
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
