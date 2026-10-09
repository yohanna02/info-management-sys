import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dataModelStub = path.resolve(
  __dirname,
  'src/types/convex-dataModel-stub.js',
)

/**
 * Vite plugin that resolves imports for the Convex `_generated/dataModel`
 * module to an empty runtime stub living outside the generated directory.
 *
 * Convex's CLI only writes a `.d.ts` for `dataModel` because the module is
 * type-only, but Vite's bundler still tries to resolve it at build time.
 * The alias below redirects those imports to a tiny no-op stub so the
 * build succeeds without affecting TypeScript type-checking.
 */
function convexDataModelStub(): Plugin {
  return {
    name: 'convex-datamodel-stub',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!importer) return null
      if (!source.endsWith('/convex/_generated/dataModel')) return null
      if (source.endsWith('.js') || source.endsWith('.ts')) return null
      // Use absolute path; do not let Vite treat it as importer-relative.
      return dataModelStub
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    convexDataModelStub(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
