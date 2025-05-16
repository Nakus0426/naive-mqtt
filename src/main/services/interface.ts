import { type PublishData, type Subscription } from '@/store/modules/connections.ts'
import { type OpenDialogOptions, type NativeTheme } from 'electron'
import { type IClientOptions } from 'mqtt'
import { type Response } from '../utils.ts'

export const enum ChannelNameEnum {
	Main = 'main',
	Mqtt = 'mqtt',
}

export const enum MainServiceEventEnum {
	AccentColorChanged,
}

export const enum MqttServiceEventEnum {
	Connected,
	Disconnected,
	End,
	Error,
	Message,
}

export interface IMainService {
	updateTheme(theme: NativeTheme['themeSource']): void
	getTheme(): NativeTheme['themeSource']
	getLocale(): string
	openFileDialog(options: OpenDialogOptions): Promise<string[]>
	getAccentColor(): string
	on(event: MainServiceEventEnum, handler: Function): void
	off(event: MainServiceEventEnum, handler: Function): void
}

export interface IMqttService {
	connect(options: IClientOptions): Promise<Response>
	disconnect(clientId: string): Promise<Response>
	publish(data: PublishData): Response
	subscribe(subscription: Subscription): Response
	unsubscribe(subscription: Subscription): Response
	connected(clientId: string | Array<string>): Map<string, boolean> | boolean
	on(event: MqttServiceEventEnum, handler: Function): void
	off(event: MqttServiceEventEnum, handler: Function): void
}
