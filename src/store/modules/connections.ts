import { defineStore } from 'pinia'
import { getItem, removeItem, setItem } from 'localforage'
import { type IClientSubscribeOptions, type IClientOptions, type IClientPublishOptions } from 'mqtt'
import { nanoid } from 'nanoid'

const CONNECTIONS_STORAGE_KEY = 'connections'

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

export const ConnectionUpdateEventKey = Symbol()
export const SubscriptionUpdateEventKey = Symbol()

export type Subscription = {
	id: string
	clientId?: Connection['clientId']
	parentId?: string
	name?: string
	enabled?: boolean
	color?: string
	topic?: string
	isGroup?: boolean
	editType?: EditTypeEnum
	children?: Array<Subscription>
} & IClientSubscribeOptions

export type PublishData = {
	clientId: Connection['clientId']
	topic: string
	message: string
	options?: IClientPublishOptions
}

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
			window.electronAPI.mqttOnConnect(handleConnectionConnected)
			window.electronAPI.mqttOnDisconnect(handleConnectionDisconnected)
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
			await removeItem(clientId)
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
			connectionUpdateNotify()
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

		function connectionUpdateNotify() {
			useEventBus(ConnectionUpdateEventKey).emit()
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
				if (success) connectionStatus.value.set(clientId, true)
				else window.$message.error(message)
			} catch ({ message }) {
				window.$message.error(message)
			}
		}

		async function disconnect(clientId: Connection['clientId']) {
			try {
				const { success, message } = await window.electronAPI.mqttDisconnect(clientId)
				if (success) connectionStatus.value.set(clientId, false)
				else window.$message.error(message)
			} catch ({ message }) {
				window.$message.error(message)
			}
		}

		function handleConnectionConnected(clientId: Connection['clientId']) {
			connectionStatus.value.set(clientId, true)
		}

		function handleConnectionDisconnected(clientId: Connection['clientId']) {
			connectionStatus.value.set(clientId, false)
		}

		function handleConnectionError(message: string) {
			window.$message.error(message)
		}
		//#endregion

		//#region 订阅增删改查
		async function getSubscriptionTree(clientId: Connection['clientId']) {
			return (await getItem<Array<Subscription>>(clientId)) || []
		}

		async function newSubscription(subscription: Subscription) {
			const tree = (await getItem<Array<Subscription>>(subscription.clientId)) || []
			subscription = toRaw(subscription)
			if (subscription.parentId)
				tree.forEach(node => node.id === subscription.parentId && node.children.push(subscription))
			else tree.push(subscription)
			await setItem(subscription.clientId, tree)
			subscriptionUpdateNotify()
		}

		async function deleteSubscription(clientId: Connection['clientId'], id: Subscription['id']) {
			const tree = (await getItem<Array<Subscription>>(clientId)) || []
			for (let i = 0, len = tree.length; i < len; i++) {
				const node = tree[i]
				if (node.id === id) {
					tree.splice(i, 1)
					break
				}
				if (node.children.length > 0) {
					for (let j = 0, len2 = node.children.length; j < len2; j++) {
						const child = node.children[j]
						if (child.id === id) {
							node.children.splice(j, 1)
							break
						}
					}
				}
			}
			await setItem(clientId, tree)
			subscriptionUpdateNotify()
		}

		async function updateSubscription(subscription: Subscription) {
			subscription = toRaw(subscription)
			const tree = (await getItem<Array<Subscription>>(subscription.clientId)) || []
			for (let i = 0, len = tree.length; i < len; i++) {
				const node = tree[i]
				if (node.id === subscription.id) {
					tree[i] = subscription
					break
				}
				if (node.children.length > 0) {
					for (let j = 0, len2 = node.children.length; j < len2; j++) {
						const child = node.children[j]
						if (child.id === subscription.id) {
							node.children[j] = subscription
							break
						}
					}
				}
			}
			await setItem(subscription.clientId, tree)
			subscriptionUpdateNotify()
		}

		async function getSubscription(clientId: Connection['clientId'], id: Subscription['id']) {
			const tree = (await getItem<Array<Subscription>>(clientId)) || []
			for (let i = 0, len = tree.length; i < len; i++) {
				const node = tree[i]
				if (node.id === id) return node
				if (node.children.length > 0) {
					const child = node.children.find(child => child.id === id)
					if (child) return child
				}
			}
			return null
		}

		async function updateSubscriptionTree(clientId: Connection['clientId'], tree: Array<Subscription>) {
			await setItem(clientId, tree)
			subscriptionUpdateNotify()
		}

		function subscriptionUpdateNotify() {
			useEventBus(SubscriptionUpdateEventKey).emit()
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
			disconnect,
			getSubscriptionTree,
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
			],
		},
	},
)
