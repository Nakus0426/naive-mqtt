import { type NativeTheme, type OpenDialogOptions, type OpenDialogReturnValue } from 'electron'
import { type CreateClientOptions } from './main/mqtt'
import { type Response } from './main/utils'

export interface ElectronAPI {
	updateTheme: (theme: NativeTheme['themeSource']) => void
	getTheme: () => NativeTheme['themeSource']
	getLocale: () => string
	createClient: (options: CreateClientOptions) => Promise<Response>
	onConnect: (callback: () => void) => void
	openFileDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue['filePaths']>
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
