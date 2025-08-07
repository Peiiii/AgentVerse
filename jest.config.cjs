module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
    "**/*.test.tsx",
    "**/*.spec.tsx"
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      },
      babelConfig: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ]
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|vfile|vfile-message|unified|bail|is-plain-obj|trough|remark-parse|mdast-util-from-markdown|micromark|decode-named-character-reference|character-entities|mdast-util-to-string|space-separated-tokens|comma-separated-tokens|property-information|hast-util-whitespace|remark-rehype|mdast-util-to-hast|unist-builder|unist-util-visit|unist-util-is|unist-util-position|unist-util-generated|mdast-util-definitions|trim-lines)/)'
  ]
}; 