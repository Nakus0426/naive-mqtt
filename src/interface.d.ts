import { type NativeTheme, type OpenDialogOptions, type OpenDialogReturnValue } from 'electron'
import { type IClientOptions } from 'mqtt'
import { type Response } from './main/utils.ts'
import { type PublishData, type Subscription } from './store/modules/connections.ts'

export interface ElectronAPI {
	updateTheme: (theme: NativeTheme['themeSource']) => void
	getTheme: () => NativeTheme['themeSource']
	getLocale: () => string
	getAccentColor: () => string
	mqttConnect: (options: IClientOptions) => Promise<Response>
	mqttDisconnect: (clientId: IClientOptions['clientId']) => Promise<Response>
	mqttConnected: (clientId: IClientOptions['clientId']) => boolean
	mqttConnectedBatch: (clientId: Array<IClientOptions['clientId']>) => Map<string, boolean>
	mqttSubscribe: (subscription: Subscription) => Promise<Response>
	mqttUnsubscribe: (subscription: Subscription) => Promise<Response>
	mqttPublish: (data: PublishData) => Promise<Response>
	mqttOnConnect: (callback: (clientId: IClientOptions['clientId']) => void) => void
	mqttOnDisconnect: (callback: (clientId: IClientOptions['clientId']) => void) => void
	mqttOnError: (callback: (message: string) => void) => void
	openFileDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue['filePaths']>
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
