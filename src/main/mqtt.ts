import { type BrowserWindow, ipcMain } from 'electron'
import { type IClientOptions, type MqttClient, connect } from 'mqtt'
import { Main } from './interface'
import { store } from './store'
import { response } from './utils'

export type CreateClientOptions = IClientOptions & { will: { payload: string } }

const clientPool = new Map<string, MqttClient>()

export class Mqtt {
	private mainWindow: BrowserWindow

	constructor(_mainWindow: BrowserWindow) {
		this.mainWindow = _mainWindow
		ipcMain.handle(
			Main.CreateClient,
			(event, options: CreateClientOptions) =>
				new Promise((resolve, reject) => {
					const { manualConnect = false, clientId } = options
					const client = connect(options)
					store.set(options.clientId, options)
					client.once('connect', () => resolve(response(true)))
					client.once('error', error => reject(response(false, error.message)))
					client.on('connect', () => this.mainWindow.webContents.send(Main.OnConnect, clientId))
					clientPool.set(options.clientId, client)
					if (manualConnect) resolve(response(true))
				}),
		)
	}
}
