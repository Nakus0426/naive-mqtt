import mqtt, { type IClientOptions, type IClientSubscribeOptions, type MqttClient } from 'mqtt'
import { response } from '../utils.ts'
import { readFileSync } from 'node:fs'
import { omitBy, isNil } from 'es-toolkit'
import { type PublishData, type Subscription } from '@/store/modules/connections.ts'
import { isArray } from 'es-toolkit/compat'
import { type IMqttService, MqttServiceEventEnum } from './interface.ts'

export class MqttService implements IMqttService {
	private clientPool = new Map<string, MqttClient>()
	private eventHandlers = new Map<MqttServiceEventEnum, Array<Function>>()

	async connect(options: IClientOptions) {
		const { clientId } = options
		let client = this.clientPool.get(clientId)
		try {
			if (client) {
				client.connect()
				return response(true)
			}
			const formatedOptions = generateConnectOptions(options)
			const { protocol, hostname, port } = formatedOptions
			const url = `${protocol}://${hostname}:${port}`
			client = await mqtt.connectAsync(url, formatedOptions)
			client.on('connect', () => this.emit(MqttServiceEventEnum.Connected, clientId))
			client.on('disconnect', () => this.emit(MqttServiceEventEnum.Disconnected, clientId))
			client.on('end', () => this.emit(MqttServiceEventEnum.End, clientId))
			client.on('error', error => this.emit(MqttServiceEventEnum.Error, error.message))
			client.on('message', (topic, message, packet) =>
				this.emit(MqttServiceEventEnum.Message, clientId, topic, message, packet),
			)
			this.clientPool.set(clientId, client)
			return response(true)
		} catch ({ message }) {
			await client.endAsync()
			return response(false, message)
		}
	}
	async disconnect(clientId: string) {
		try {
			if (!this.clientPool.has(clientId)) return response(true)
			await this.clientPool.get(clientId).endAsync()
			this.clientPool.delete(clientId)
			return response(true)
		} catch ({ message }) {
			return response(false, message)
		}
	}
	publish(data: PublishData) {
		try {
			if (!this.clientPool.has(data.clientId)) return response(false)
			this.clientPool.get(data.clientId).publish(data.topic, data.message, data.options)
			return response(true)
		} catch ({ message }) {
			return response(false, message)
		}
	}
	subscribe(subscription: Subscription) {
		try {
			if (!this.clientPool.has(subscription.clientId)) return response(false)
			this.clientPool.get(subscription.clientId).subscribe(subscription.topic, generateSubscribeOptions(subscription))
			return response(true)
		} catch ({ message }) {
			return response(false, message)
		}
	}
	unsubscribe(subscription: Subscription) {
		try {
			if (!this.clientPool.has(subscription.clientId)) return response(false)
			this.clientPool.get(subscription.clientId).unsubscribe(subscription.topic)
			return response(true)
		} catch ({ message }) {
			return response(false, message)
		}
	}
	connected(clientId: string | Array<string>) {
		if (isArray(clientId)) {
			const res = new Map<string, boolean>()
			clientId.forEach(item => {
				const client = this.clientPool.get(item)
				res.set(item, client ? client.connected : false)
			})
			return res
		}
		const client = this.clientPool.get(clientId)
		return client ? client.connected : false
	}
	on(event: MqttServiceEventEnum, handler: Function) {
		if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, [])
		else this.eventHandlers.get(event)?.push(handler)
	}
	off(event: MqttServiceEventEnum, handler: Function) {
		const handlers = this.eventHandlers.get(event)
		if (!handlers) return
		const index = handlers.indexOf(handler)
		if (index !== -1) handlers.splice(index, 1)
	}
	private emit(event: MqttServiceEventEnum, ...args: any[]) {
		const handlers = this.eventHandlers.get(event)
		if (!handlers) return
		handlers.forEach(handler => handler(...args))
	}
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
