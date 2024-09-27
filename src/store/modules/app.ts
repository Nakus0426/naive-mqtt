import { defineStore } from 'pinia'

/**
 * 系统状态
 */
export const useAppStore = defineStore(
	'APP',
	() => {
		const isDarkTheme = useDark({ selector: 'html', attribute: 'color-scheme', valueDark: 'dark', valueLight: 'light' })

		const isMenuCollapsed = ref(true)

		return {
			isDarkTheme,
			isMenuCollapsed,
		}
	},
	{
		persist: {
			pick: ['isDarkTheme', 'isMenuCollapsed'],
		},
	},
)
