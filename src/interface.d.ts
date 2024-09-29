import { NativeTheme } from 'electron'

export interface ElectronAPI {
	updateTheme: (theme: NativeTheme['themeSource']) => void
	getTheme: () => NativeTheme['themeSource']
	getLocale: () => string
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
