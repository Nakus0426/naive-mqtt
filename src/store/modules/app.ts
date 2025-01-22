import { defaultPrimaryColorDark, defaultPrimaryColorLight } from '@/configs/theme.ts'
import { type NativeTheme } from 'electron'
import { defineStore } from 'pinia'

/**
 * 系统状态
 */
export const useAppStore = defineStore(
	'APP',
	() => {
		//#region 主题
		const isDarkTheme = useDark({ selector: 'html', attribute: 'color-scheme', valueDark: 'dark', valueLight: 'light' })
		const theme = ref<NativeTheme['themeSource']>('system')
		theme.value = window.electronAPI.getTheme()
		//#endregion

		//#region 强调色
		const primaryColor = ref<string>()
		if (!primaryColor.value) primaryColorRestoreDefaults()

		function primaryColorRestoreDefaults() {
			primaryColor.value = isDarkTheme.value ? defaultPrimaryColorDark : defaultPrimaryColorLight
		}

		function primaryColorFollowSystem() {
			const accentColor = `#${window.electronAPI.getAccentColor()}`
			primaryColor.value = accentColor
				? accentColor
				: isDarkTheme.value
					? defaultPrimaryColorDark
					: defaultPrimaryColorLight
		}
		//#endregion

		const isMenuCollapsed = ref(true)

		const locale = ref('zh-CN')
		locale.value = window.electronAPI.getLocale()

		return {
			isDarkTheme,
			theme,
			primaryColorRestoreDefaults,
			primaryColorFollowSystem,
			primaryColor,
			isMenuCollapsed,
			locale,
		}
	},
	{
		persist: {
			pick: ['isDarkTheme', 'primaryColor', 'isMenuCollapsed', 'locale'],
		},
	},
)
