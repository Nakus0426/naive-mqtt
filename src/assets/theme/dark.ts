import { GlobalThemeOverrides } from 'naive-ui'

export const customDarkThemeOverrides: GlobalThemeOverrides = {
	common: {
		fontFamily: 'MiSans-Regular',
		borderRadius: '8px',
		borderRadiusSmall: '4px',
		dividerColor: '#27272A',
		borderColor: '#3F3F46',
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
		railInsetHorizontal: 'auto 3px 3px 3px',
		railInsetVertical: '3px 3px 3px auto',
		width: '4px',
		height: '4px',
		borderRadius: '2px',
	},
	Slider: {
		indicatorColor: '#FFFFFF',
		indicatorTextColor: '#000000',
	},
}
