import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@langscale/react': fileURLToPath(
        new URL(
          '../../packages/@langscale/react/src/index.ts',
          import.meta.url
        )
      ),
      langscale: fileURLToPath(
        new URL(
          '../../packages/langscale/src/index.ts',
          import.meta.url
        )
      )
    }
  }
})
