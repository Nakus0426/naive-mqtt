import { ConfigEnv, defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import type { ComponentResolver } from 'unplugin-vue-components/types'
import { pluginExposeRenderer } from './vite.base.config'

export default defineConfig(env => {
	const forgeEnv = env as ConfigEnv<'renderer'>
	const { root, mode, forgeConfigSelf } = forgeEnv
	const name = forgeConfigSelf.name ?? ''

	return {
		root,
		mode,
		base: './',
		server: {
			port: 3000,
		},
		build: {
			outDir: `.vite/renderer/${name}`,
		},
		resolve: {
			alias: [{ find: '@', replacement: '/src' }],
			preserveSymlinks: true,
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern-compiler',
				},
			},
		},
		plugins: [
			Vue(),
			VueJsx(),
			Components({
				dts: 'src/components.d.ts',
				globs: ['src/components/**!(modules)/index.vue', 'src/components/*.vue'],
				resolvers: [NaiveUiResolver(), IconifyResolver()],
			}),
			AutoImport({
				dts: 'src/z-auto-imports.d.ts',
				imports: [
					'vue',
					'vue-router',
					'@vueuse/core',
					{
						'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar', 'useModal', 'useThemeVars'],
						vue: ['useTemplateRef'],
					},
				],
				vueTemplate: true,
			}),
			pluginExposeRenderer(name),
		],
	}
})

/**
 * 自动导入Iconify组件
 */
function IconifyResolver(): ComponentResolver {
	return {
		type: 'component',
		resolve: name => {
			if (name === 'Icon' || name === 'icon') return { name: 'Icon', from: '@iconify/vue' }
		},
	}
}
