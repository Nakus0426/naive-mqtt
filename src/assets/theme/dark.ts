import { GlobalThemeOverrides } from 'naive-ui'

export const customDarkThemeOverrides: GlobalThemeOverrides = {
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
