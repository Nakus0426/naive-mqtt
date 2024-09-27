import { GlobalThemeOverrides } from 'naive-ui'

export const customLightThemeOverrides: GlobalThemeOverrides = {
	common: {
		fontFamily: 'MiSans-Regular',
		borderRadius: '8px',
		borderRadiusSmall: '4px',
		borderColor: '#dddddd',
		dividerColor: '#e8e8e8',
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
