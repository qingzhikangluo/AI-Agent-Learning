import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/.pytest_cache/**',
      '**/.ruff_cache/**',
      '**/.venv/**',
      '**/coverage/**',
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,mjs,js}'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['docs/ui-concept/wireframe/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  }
)
