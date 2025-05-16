import { defaultPrimaryColorDark, defaultPrimaryColorLight } from '@/configs/theme.ts'
import { type NativeTheme } from 'electron'
import { defineStore } from 'pinia'
import { useService } from 'electron-bridge-ipc/electron-sandbox'
import { type IMainService, ChannelNameEnum, MainServiceEventEnum } from '@/main/services/interface.ts'

/**
 * 系统状态
 */
export const useAppStore = defineStore(
	'APP',
	() => {
		const mainService = useService<IMainService>(ChannelNameEnum.Main)

		//#region 主题
		const isDarkTheme = useDark({ selector: 'html', attribute: 'color-scheme', valueDark: 'dark', valueLight: 'light' })
		const theme = ref<NativeTheme['themeSource']>('system')
		theme.value = mainService.getTheme()
		//#endregion

		//#region 强调色
		const primaryColor = ref<string>()
		const isPrimaryColorFollowSystem = ref(true)
		if (!primaryColor.value) primaryColorRestoreDefaults()
		if (isPrimaryColorFollowSystem.value) primaryColorFollowSystem()

		function primaryColorRestoreDefaults() {
			primaryColor.value = isDarkTheme.value ? defaultPrimaryColorDark : defaultPrimaryColorLight
		}

		function primaryColorFollowSystem() {
			const accentColor = `#${mainService.getAccentColor()}`
			primaryColor.value = accentColor
				? accentColor
				: isDarkTheme.value
					? defaultPrimaryColorDark
					: defaultPrimaryColorLight
		}

		mainService.on(MainServiceEventEnum.AccentColorChanged, color => (primaryColor.value = `#${color}`))
		//#endregion

		const isMenuCollapsed = ref(true)

		const locale = ref('zh-CN')
		locale.value = mainService.getLocale()

		return {
			isDarkTheme,
			theme,
			isPrimaryColorFollowSystem,
			primaryColorRestoreDefaults,
			primaryColorFollowSystem,
			primaryColor,
			isMenuCollapsed,
			locale,
		}
	},
	{
		persist: {
			pick: ['isDarkTheme', 'primaryColor', 'isPrimaryColorFollowSystem', 'isMenuCollapsed', 'locale'],
		},
	},
)
