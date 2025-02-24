import { type NativeTheme, type OpenDialogOptions, type OpenDialogReturnValue } from 'electron'
import { type IClientOptions, type IPublishPacket } from 'mqtt'
import { type Response } from './main/utils.ts'
import { type PublishData, type Subscription } from './store/modules/connections.ts'

export interface ElectronAPI {
	updateTheme: (theme: NativeTheme['themeSource']) => void
	getTheme: () => NativeTheme['themeSource']
	getLocale: () => string
	getAccentColor: () => string
	onAccentColorChanged: (callback: (color: string) => void) => void
	mqttConnect: (options: IClientOptions) => Promise<Response>
	mqttDisconnect: (clientId: string) => Promise<Response>
	mqttConnected: (clientId: string) => boolean
	mqttConnectedBatch: (clientId: Array<string>) => Map<string, boolean>
	mqttSubscribe: (subscription: Subscription) => Promise<Response>
	mqttUnsubscribe: (subscription: Subscription) => Promise<Response>
	mqttPublish: (data: PublishData) => Promise<Response>
	onMqttConnect: (callback: (clientId: string) => void) => void
	onMqttDisconnect: (callback: (clientId: string) => void) => void
	onMqttError: (callback: (message: string) => void) => void
	onMqttMessage: (callback: (clientId: string, topic: string, message: Buffer, packet: IPublishPacket) => void) => void
	openFileDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue['filePaths']>
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
