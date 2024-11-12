import { defineStore } from 'pinia'
import { getItem, setItem } from 'localforage'
import { type IClientOptions } from 'mqtt'
import { nanoid } from 'nanoid'

const CONNECTIONS_STORAGE_KEY = 'connections'

export type Connection = {
	name: string
	parentClientId: string
	isGroup?: boolean
	children?: Array<Connection>
} & Record<string, any> &
	IClientOptions

/**
 * 连接
 */
export const useConnectionsStore = defineStore(
	'CONNECTIONS',
	() => {
		const isImmediateConnect = ref(false)

		const sideWidth = ref(300)
		const sideCollapsed = ref(false)
		const contentSideWidth = ref(200)
		const contentFooterHeight = ref(100)
		const contentFooterCollapsed = ref(false)

		const connectionTree = ref<Array<Connection>>([])

		const connectionStatus = ref<Map<Connection['clientId'], boolean>>()

		async function init() {
			connectionTree.value = await getConnectionTree()
			window.electronAPI.mqttOnConnect(handleConnectionConnected)
			window.electronAPI.mqttOnError(handleConnectionError)
			initConnectionStatus()
		}

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
		}

		function connectionUpdateNotify(clientId) {}

		function generateClientId() {
			return `naive_mqtt_${nanoid()}`
		}

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
			getConnectionTree,
			newConnection,
			deleteConnection,
			updateConnection,
			getConnection,
			updateConnectionTree,
			generateClientId,
			connect,
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
