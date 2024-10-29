import { defineConfig, mergeConfig, type ConfigEnv, type UserConfig } from 'vite'
import { getBuildConfig, getBuildDefine, external, esModule, pluginHotRestart } from './vite.base.config'

export default defineConfig(env => {
	const forgeEnv = env as ConfigEnv<'build'>
	const { forgeConfigSelf } = forgeEnv
	const define = getBuildDefine(forgeEnv)
	const config: UserConfig = {
		build: {
			lib: {
				entry: forgeConfigSelf.entry!,
				fileName: () => '[name].mjs',
				formats: [esModule ? 'es' : 'cjs'],
			},
			rollupOptions: {
				external,
			},
		},
		define,
		resolve: {
			mainFields: ['module', 'jsnext:main', 'jsnext'],
		},
		plugins: [pluginHotRestart('restart')],
	}
	return mergeConfig(getBuildConfig(forgeEnv), config)
})
