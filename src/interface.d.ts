import { NativeTheme } from 'electron'

export interface ElectronAPI {
	updateTheme: (theme: NativeTheme['themeSource']) => void
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
