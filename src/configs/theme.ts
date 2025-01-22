import { type GlobalThemeOverrides } from 'naive-ui'
import Color from 'color'

const lightTheme: GlobalThemeOverrides = {
	common: {
		fontFamily: 'HarmonyOS_Sans_Regular',
		borderRadius: '8px',
		borderRadiusSmall: '4px',
		bodyColor: '#F8F8F8',
		fontSizeSmall: '12px',
		fontSizeMedium: '14px',
		fontSizeLarge: '16px',
		fontSizeHuge: '18px',
		lineHeight: '1.5',
	},
	Popover: {
		padding: '8px',
	},
	Tooltip: {
		color: '#000000',
		peers: {
			Popover: {
				fontSize: '12px',
				padding: '3px 6px',
			},
		},
	},
	Drawer: {
		borderRadius: '0px',
	},
	Scrollbar: {
		railInsetHorizontalBottom: 'auto 3px 3px 3px',
		railInsetVerticalRight: '3px 3px 3px auto',
		width: '4px',
		height: '4px',
		borderRadius: '2px',
	},
	Slider: {
		indicatorColor: '#000000',
	},
}

const darkTheme: GlobalThemeOverrides = {
	common: {
		fontFamily: 'HarmonyOS_Sans_Regular',
		borderRadius: '8px',
		borderRadiusSmall: '4px',
		borderColor: '#3F3F46',
		dividerColor: '#27272A',
		popoverColor: '#18181B',
		modalColor: '#18181B',
		cardColor: '#18181B',
		bodyColor: '#09090B',
		fontSizeSmall: '12px',
		fontSizeMedium: '14px',
		fontSizeLarge: '16px',
		lineHeight: '1.5',
		buttonColor2: '#1E1E1E',
	},
	Popover: {
		padding: '8px',
	},
	Tooltip: {
		color: '#FFFFFF',
		textColor: '#000000',
		peers: {
			Popover: {
				fontSize: '12px',
				padding: '3px 6px',
			},
		},
	},
	Drawer: {
		borderRadius: '0px',
	},
	Scrollbar: {
		railInsetHorizontalBottom: 'auto 3px 3px 3px',
		railInsetVerticalRight: '3px 3px 3px auto',
		width: '4px',
		height: '4px',
		borderRadius: '2px',
	},
	Slider: {
		indicatorColor: '#FFFFFF',
		indicatorTextColor: '#000000',
	},
}

export const defaultPrimaryColorLight = '#18a058'
export const defaultPrimaryColorDark = '#63e2b7'

export function generateThemeOverrides(isDarkTheme = false, primaryColor: string) {
	const primaryColorObj = new Color(primaryColor)
	primaryColor = isDarkTheme ? primaryColorObj.lighten(0.2).hex() : primaryColorObj.hex()
	const lightenPrimaryColor = primaryColorObj.lighten(0.2).hex()
	const darkenPrimaryColor = primaryColorObj.darken(0.2).hex()
	const themeOverrides = isDarkTheme ? darkTheme : lightTheme
	themeOverrides.common.primaryColor = primaryColor
	themeOverrides.common.primaryColorHover = lightenPrimaryColor
	themeOverrides.common.primaryColorPressed = darkenPrimaryColor
	themeOverrides.common.primaryColorSuppl = lightenPrimaryColor
	return themeOverrides
}
