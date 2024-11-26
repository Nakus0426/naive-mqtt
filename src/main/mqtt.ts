import { type BrowserWindow, ipcMain } from 'electron'
import { type IClientOptions, type IClientSubscribeOptions, type MqttClient, connectAsync } from 'mqtt'
import { Main } from './interface.ts'
import { response } from './utils.ts'
import { readFileSync } from 'node:fs'
import { omitBy, isNil } from 'es-toolkit'
import { type Subscription } from '@/store/modules/connections.ts'

const clientPool = new Map<string, MqttClient>()

export function mqtt(mainWindow: BrowserWindow) {
	ipcMain.handle(Main.MqttConnect, async (_event, options: IClientOptions) => {
		const { clientId } = options
		let client = clientPool.get(clientId)
		try {
			if (!client) {
				const formatedOptions = generateConnectOptions(options)
				const { protocol, hostname, port } = formatedOptions
				const url = `${protocol}://${hostname}:${port}`
				client = await connectAsync(url, formatedOptions)
				client.on('connect', () => {
					console.log('connected')
					mainWindow.webContents.send(Main.MqttOnConnect, clientId)
				})
				client.on('disconnect', () => {
					console.log('disconnected')
					mainWindow.webContents.send(Main.MqttOnDisconnect, clientId)
				})
				client.on('end', () => {
					console.log('end')
					mainWindow.webContents.send(Main.MqttOnDisconnect, clientId)
				})
				client.on('error', error => {
					console.log('error', error)
					mainWindow.webContents.send(Main.MqttOnError, error.message)
				})
				clientPool.set(clientId, client)
				return response(true)
			}
			if (client.connected) return response(true)
			else {
				client.connect()
				return response(true)
			}
		} catch ({ message }) {
			await client.endAsync()
			return response(false, message)
		}
	})

	ipcMain.handle(Main.MqttDisconnect, async (_event, clientId: IClientOptions['clientId']) => {
		try {
			const client = clientPool.get(clientId)
			if (!client) return response(true)
			await client.endAsync()
			return response(true)
		} catch ({ message }) {
			return response(false, message)
		}
	})

	ipcMain.on(Main.MqttConnected, (event, clientId: IClientOptions['clientId']) => {
		const client = clientPool.get(clientId)
		event.returnValue = client ? client.connected : false
	})

	ipcMain.on(Main.MqttConnectedBatch, (event, clientId: Array<IClientOptions['clientId']>) => {
		const res = new Map<IClientOptions['clientId'], boolean>()
		clientId.forEach(item => {
			const client = clientPool.get(item)
			res.set(item, client ? client.connected : false)
		})
		event.returnValue = res
	})

	ipcMain.handle(Main.MqttSubscribe, async (_event, subscription: Subscription) => {
		try {
			const client = clientPool.get(subscription.clientId)
			if (!client) return response(false)
			const res = await client.subscribeAsync(subscription.topic, generateSubscribeOptions(subscription))
			console.log(res)
			return response(true)
		} catch (err) {
			return response(false, err.message)
		}
	})

	ipcMain.handle(Main.MqttUnsubscribe, async (_event, subscription: Subscription) => {
		try {
			const client = clientPool.get(subscription.clientId)
			if (!client) return response(false)
			const res = await client.unsubscribeAsync(subscription.topic)
			console.log(res)
			return response(true)
		} catch (err) {
			return response(false, err.message)
		}
	})
}

function generateConnectOptions(options: IClientOptions) {
	const res: IClientOptions = {
		protocol: options.protocol,
		protocolVersion: options.protocolVersion,
		clientId: options.clientId,
		clean: options.clean,
		reconnectPeriod: options.reconnectPeriod,
		hostname: options.hostname,
		port: options.port,
		username: options.username,
		password: options.password,
		rejectUnauthorized: options.rejectUnauthorized,
		connectTimeout: options.connectTimeout,
		keepalive: options.keepalive,
	}
	if (options.caPaths) res.ca = readFileSync(options.caPaths as string)
	if (options.certPath) res.cert = readFileSync(options.certPath)
	if (options.keyPath) res.key = readFileSync(options.keyPath)
	if (options.protocolVersion === 3) res.protocolId = 'MQIsdp'
	if (options.protocolVersion === 5 && options.properties) {
		res.properties = omitBy(
			options.properties,
			value => isNil(value) || (typeof value === 'object' && Object.keys(value).length === 0),
		)
		if (isNil(options.properties.sessionExpiryInterval) && !options.clean)
			res.properties.sessionExpiryInterval = parseInt('0xFFFFFFFF', 16)
	}
	if (options.ALPNProtocols) res.ALPNProtocols = options.ALPNProtocols
	if (!['', null, undefined].includes(options.will?.topic)) {
		res.will = {
			topic: options.will.topic,
			payload: options.will.payload,
			qos: options.will.qos,
			retain: options.will.retain,
		}
		if (options.protocolVersion === 5 && options.will?.properties) {
			res.will.properties = omitBy(options.will.properties, value => isNil(value))
		}
	}
	return res
}

function generateSubscribeOptions(subscription: Subscription): IClientSubscribeOptions {
	return {
		qos: subscription.qos,
		nl: subscription.nl,
		rap: subscription.rap,
		rh: subscription.rh,
	}
}
