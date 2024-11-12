import { type NativeTheme, type OpenDialogOptions, type OpenDialogReturnValue } from 'electron'
import { type IClientOptions } from 'mqtt'
import { type Response } from './main/utils.ts'

export interface ElectronAPI {
	updateTheme: (theme: NativeTheme['themeSource']) => void
	getTheme: () => NativeTheme['themeSource']
	getLocale: () => string
	mqttConnect: (options: IClientOptions) => Promise<Response>
	mqttDisconnect: (clientId: IClientOptions['clientId']) => Promise<Response>
	mqttConnected: (clientId: IClientOptions['clientId']) => boolean
	mqttConnectedBatch: (clientId: Array<IClientOptions['clientId']>) => Map<string, boolean>
	mqttOnConnect: (callback: (clientId: IClientOptions['clientId']) => void) => void
	mqttOnError: (callback: (message: string) => void) => void
	openFileDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue['filePaths']>
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
