import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import { getBuildConfig, external, esModule, pluginHotRestart } from './vite.base.config'

export default defineConfig(env => {
	const forgeEnv = env as ConfigEnv<'build'>
	const { forgeConfigSelf } = forgeEnv
	const ext = esModule ? 'mjs' : 'js'
	const config: UserConfig = {
		build: {
			rollupOptions: {
				watch: false,
				external,
				input: forgeConfigSelf.entry!,
				output: {
					format: 'cjs',
					inlineDynamicImports: true,
					entryFileNames: `[name].${ext}`,
					chunkFileNames: `[name].${ext}`,
					assetFileNames: '[name].[ext]',
				},
			},
		},
		plugins: [pluginHotRestart('reload')],
	}

	return mergeConfig(getBuildConfig(forgeEnv), config)
})
