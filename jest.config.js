/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',             // Usa o ts-jest para transformar TS
  testEnvironment: 'node',       // Ambiente Node para executar os testes

  // Onde buscar arquivos de teste e código-fonte
  roots: ['<rootDir>/src', '<rootDir>/test'],

  // Transformação: arquivos .ts e .js passam pelo ts-jest
  transform: {
    '^.+\.(ts|js)$': 'ts-jest',
  },

  // Reconhece testes com extensão .test.ts/.spec.ts dentro de /test
  testRegex: '(/test/.*|(\.|/)(test|spec))\.(ts|js)$',

  moduleFileExtensions: ['ts', 'js', 'json'],

  // Coleta cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
};