import { defineStore } from 'pinia'
import { getItem, setItem } from 'localforage'
import { type IClientSubscribeOptions, type IClientOptions } from 'mqtt'
import { nanoid } from 'nanoid'
import { EventBusKey } from '@vueuse/core'

const CONNECTIONS_STORAGE_KEY = 'connections'
const SUBSCRIPTIONS_STORAGE_KEY = 'subscriptions'

export enum EditTypeEnum {
	New,
	Rename,
}

export type Connection = {
	name: string
	parentClientId: string
	isGroup?: boolean
	editType?: EditTypeEnum
	children?: Array<Connection>
} & Record<string, any> &
	IClientOptions

export const ConnectionUpdateEventKey: EventBusKey<Connection['clientId']> = Symbol()
export const SubscriptionUpdateEventKey: EventBusKey<Subscription['id']> = Symbol()

export type Subscription = {
	id: string
	parentId?: string
	name?: string
	color?: string
	topic: string
	children?: Array<Subscription>
} & IClientSubscribeOptions

/**
 * 连接
 */
export const useConnectionsStore = defineStore(
	'CONNECTIONS',
	() => {
		const sideWidth = ref(300)
		const sideCollapsed = ref(false)
		const contentSideWidth = ref(200)
		const contentFooterHeight = ref(100)
		const contentFooterCollapsed = ref(false)

		async function init() {
			connectionTree.value = await getConnectionTree()
			subscriptionTree.value = await getSubscriptionTree()
			window.electronAPI.mqttOnConnect(handleConnectionConnected)
			window.electronAPI.mqttOnError(handleConnectionError)
			initConnectionStatus()
		}

		//#region 连接增删改查
		const connectionTree = ref<Array<Connection>>([])
		const connectionStatus = ref<Map<Connection['clientId'], boolean>>()
		const isImmediateConnect = ref(false)

		function initConnectionStatus() {
			const clientIdList = []
			connectionTree.value.forEach(node => {
				if (node.isGroup) node.children.forEach(child => clientIdList.push(child.clientId))
				else clientIdList.push(node.clientId)
			})
			connectionStatus.value = window.electronAPI.mqttConnectedBatch(clientIdList)
		}

		async function getConnectionTree() {
			const res = await getItem<Array<Connection>>(CONNECTIONS_STORAGE_KEY)
			return res || []
		}

		async function newConnection(connection: Connection) {
			if (connection.parentClientId)
				for (const item of connectionTree.value) {
					if (item.clientId === connection.parentClientId) {
						if (item.children) item.children.push(connection)
						else item.children = [connection]
						break
					}
				}
			else connectionTree.value.push(connection)
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connectionTree.value))
		}

		async function deleteConnection(clientId: Connection['clientId']) {
			const queue = connectionTree.value.slice()
			while (queue.length > 0) {
				const currentNode = queue.shift()
				for (let i = currentNode.children.length - 1; i >= 0; i--) {
					const childNode = currentNode.children[i]
					if (childNode.clientId === clientId) {
						currentNode.children.splice(i, 1)
						queue.push(childNode)
					}
				}
				if (currentNode.clientId === clientId && connectionTree.value.some(item => item.clientId === clientId)) {
					const index = connectionTree.value.findIndex(item => item.clientId === clientId)
					connectionTree.value.splice(index, 1)
				}
			}
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connectionTree.value))
		}

		async function updateConnection(connection: Connection) {
			const findSiblings = (clientId: Connection['clientId'], tree: Array<Connection>) => {
				if (!tree) return [null, null]
				const index = tree.findIndex(node => node.clientId === clientId)
				if (index !== -1) return [tree, index]
				for (const node of tree) {
					const [siblings, siblingIndex] = findSiblings(clientId, node.children)
					if (siblings) return [siblings, siblingIndex]
				}
				return [null, null]
			}
			const [siblings, siblingIndex] = findSiblings(connection.clientId, connectionTree.value)
			if (!siblings || siblingIndex === null) return
			siblings[siblingIndex] = connection
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connectionTree.value))
			connectionUpdateNotify(connection.clientId)
		}

		function getConnection(clientId: Connection['clientId']) {
			const queue = toRaw(connectionTree.value).slice()
			while (queue.length > 0) {
				let currentNode = queue.shift()
				if (currentNode.clientId === clientId) return currentNode
				currentNode.children.forEach(item => queue.push(item))
			}
		}

		async function updateConnectionTree(tree: Array<Connection>) {
			connectionTree.value = tree
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connectionTree.value))
			connectionUpdateNotify()
		}

		function connectionUpdateNotify(clientId?: Connection['clientId']) {
			useEventBus(ConnectionUpdateEventKey).emit(clientId)
		}

		function generateClientId() {
			return `naive_mqtt_${nanoid()}`
		}
		//#endregion

		//#region 连接客户端
		async function connect(clientId: Connection['clientId']) {
			try {
				const connection = getConnection(clientId)
				if (!connection) return
				const { success, message } = await window.electronAPI.mqttConnect(connection)
				if (!success) window.$message.error(message)
			} catch ({ message }) {
				window.$message.error(message)
			}
		}

		function handleConnectionConnected(clientId: Connection['clientId']) {
			connectionStatus.value.set(clientId, true)
		}

		function handleConnectionError(message: string) {
			window.$message.error(message)
		}
		//#endregion

		//#region 订阅增删改查
		const subscriptionTree = ref<Array<Subscription>>([])

		async function getSubscriptionTree() {
			const res = await getItem<Array<Subscription>>(SUBSCRIPTIONS_STORAGE_KEY)
			return res || []
		}

		async function newSubscription(subscription: Subscription) {
			if (subscription.parentId)
				for (const item of subscriptionTree.value) {
					if (item.id === subscription.parentId) {
						if (item.children) item.children.push(subscription)
						else item.children = [subscription]
						break
					}
				}
			else subscriptionTree.value.push(subscription)
			await setItem(SUBSCRIPTIONS_STORAGE_KEY, toRaw(subscriptionTree.value))
		}

		async function deleteSubscription(id: Subscription['id']) {
			const queue = subscriptionTree.value.slice()
			while (queue.length > 0) {
				const currentNode = queue.shift()
				for (let i = currentNode.children.length - 1; i >= 0; i--) {
					const childNode = currentNode.children[i]
					if (childNode.id === id) {
						currentNode.children.splice(i, 1)
						queue.push(childNode)
					}
				}
				if (currentNode.id === id && subscriptionTree.value.some(item => item.id === id)) {
					const index = subscriptionTree.value.findIndex(item => item.id === id)
					connectionTree.value.splice(index, 1)
				}
			}
			await setItem(SUBSCRIPTIONS_STORAGE_KEY, toRaw(subscriptionTree.value))
		}

		async function updateSubscription(subscription: Subscription) {
			const findSiblings = (id: Subscription['id'], tree: Array<Subscription>) => {
				if (!tree) return [null, null]
				const index = tree.findIndex(node => node.id === id)
				if (index !== -1) return [tree, index]
				for (const node of tree) {
					const [siblings, siblingIndex] = findSiblings(id, node.children)
					if (siblings) return [siblings, siblingIndex]
				}
				return [null, null]
			}
			const [siblings, siblingIndex] = findSiblings(subscription.id, subscriptionTree.value)
			if (!siblings || siblingIndex === null) return
			siblings[siblingIndex] = subscription
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connectionTree.value))
			subscriptionUpdateNotify(subscription.id)
		}

		function getSubscription(id: Subscription['id']) {
			const queue = toRaw(subscriptionTree.value).slice()
			while (queue.length > 0) {
				let currentNode = queue.shift()
				if (currentNode.id === id) return currentNode
				currentNode.children.forEach(item => queue.push(item))
			}
		}

		async function updateSubscriptionTree(tree: Array<Subscription>) {
			subscriptionTree.value = tree
			await setItem(SUBSCRIPTIONS_STORAGE_KEY, toRaw(subscriptionTree.value))
			subscriptionUpdateNotify()
		}

		function subscriptionUpdateNotify(id?: Subscription['id']) {
			useEventBus(SubscriptionUpdateEventKey).emit(id)
		}
		//#endregion

		return {
			isImmediateConnect,
			sideCollapsed,
			sideWidth,
			contentSideWidth,
			contentFooterHeight,
			connectionTree,
			connectionStatus,
			contentFooterCollapsed,
			init,
			newConnection,
			deleteConnection,
			updateConnection,
			getConnection,
			updateConnectionTree,
			generateClientId,
			connect,
			newSubscription,
			deleteSubscription,
			updateSubscription,
			getSubscription,
			updateSubscriptionTree,
		}
	},
	{
		persist: {
			pick: [
				'sideCollapsed',
				'sideWidth',
				'contentSideWidth',
				'contentFooterHeight',
				'contentFooterCollapsed',
				'connectionTree',
				'isImmediateConnect',
				'subscriptionTree',
			],
		},
	},
)
