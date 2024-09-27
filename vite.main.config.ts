import { defineConfig, mergeConfig, type ConfigEnv, type UserConfig } from 'vite'
import { getBuildConfig, getBuildDefine, external, esModule } from './vite.base.config.ts'

export default defineConfig(env => {
	const forgeEnv = env as ConfigEnv<'build'>
	const { forgeConfigSelf } = forgeEnv
	const define = getBuildDefine(forgeEnv)
	const config: UserConfig = {
		build: {
			lib: {
				entry: forgeConfigSelf.entry!,
				fileName: () => '[name].js',
				formats: [esModule ? 'es' : 'cjs'],
			},
			rollupOptions: {
				watch: false,
				external,
			},
		},
		define,
		resolve: {
			mainFields: ['module', 'jsnext:main', 'jsnext'],
		},
	}
	console.log(mergeConfig(getBuildConfig(forgeEnv), config))
	return mergeConfig(getBuildConfig(forgeEnv), config)
})
