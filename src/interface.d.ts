import { type NativeTheme } from 'electron'
import { type CreateClientOptions } from './main/mqtt.ts'
import { type Response } from './main/utils.ts'

export interface ElectronAPI {
	updateTheme: (theme: NativeTheme['themeSource']) => void
	getTheme: () => NativeTheme['themeSource']
	getLocale: () => string
	createClient: (options: CreateClientOptions) => Promise<Response>
	onConnect: (callback: () => void) => void
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
