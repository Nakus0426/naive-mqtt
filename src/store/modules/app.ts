import { type NativeTheme } from 'electron'
import { defineStore } from 'pinia'

/**
 * 系统状态
 */
export const useAppStore = defineStore(
	'APP',
	() => {
		const isDarkTheme = useDark({ selector: 'html', attribute: 'color-scheme', valueDark: 'dark', valueLight: 'light' })
		const theme = ref<NativeTheme['themeSource']>('system')
		theme.value = window.electronAPI.getTheme()

		const isMenuCollapsed = ref(true)

		const locale = ref('zh-CN')
		locale.value = window.electronAPI.getLocale()

		return {
			isDarkTheme,
			theme,
			isMenuCollapsed,
			locale,
		}
	},
	{
		persist: {
			pick: ['isDarkTheme', 'isMenuCollapsed', 'locale'],
		},
	},
)
