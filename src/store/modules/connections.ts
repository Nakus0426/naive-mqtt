import { defineStore } from 'pinia'
import { getItem, setItem } from 'localforage'
import { type CreateClientOptions } from '@/main/mqtt'
import { TreeOption } from 'naive-ui'
import { nanoid } from 'nanoid'
import { last, orderBy } from 'es-toolkit'
import { arrayToTree } from '@/main/utils'

const CONNECTIONS_STORAGE_KEY = 'connections'

export type Connection = {
	name: string
	parentClientId: string
	connected?: boolean
	order?: number
	isGroup?: boolean
} & Record<string, any> &
	CreateClientOptions

/**
 * 连接
 */
export const useConnectionsStore = defineStore(
	'CONNECTIONS',
	() => {
		const isImmediateConnect = ref(false)

		const connections = ref<Array<Connection>>([])
		const connectionTree = computed<Array<TreeOption>>(() => {
			const _connections = orderBy(connections.value, ['order'], ['asc'])
			return arrayToTree(_connections, {
				idField: 'clientId',
				parentField: 'groupId',
				callback(node) {
					node.isLeaf = !node.isGroup
					node.data = node
					return node
				},
			})
		})

		async function init() {
			connections.value = await getConnections()
		}

		async function getConnections() {
			const res = await getItem<Array<Connection>>(CONNECTIONS_STORAGE_KEY)
			return res || []
		}

		async function updateConnection(value: Connection) {
			value = toRaw(value)
			const index = connections.value.findIndex(({ clientId }) => clientId === value.clientId)
			if (index === -1) return
			connections.value.splice(index, 1, value)
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connections.value))
		}

		async function updateConnectionBatch(value: Array<Connection>) {
			value = toRaw(value)
			connections.value = value
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connections.value))
		}

		async function deleteConnection(value: Connection['clientId']) {
			const index = connections.value.findIndex(item => item.clientId === value)
			if (index === -1) return
			connections.value.splice(index, 1)
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connections.value))
		}

		async function newConnection(value: Connection) {
			value = toRaw(value)
			value.order = last(connections.value)?.order + 1 || 0
			connections.value.push(value)
			await setItem(CONNECTIONS_STORAGE_KEY, toRaw(connections.value))
		}

		function generateClientId() {
			return `naive_mqtt_${nanoid()}`
		}

		return {
			isImmediateConnect,
			connections,
			connectionTree,
			init,
			getConnections,
			updateConnection,
			updateConnectionBatch,
			deleteConnection,
			newConnection,
			generateClientId,
		}
	},
	{
		persist: {
			pick: ['connections', 'connectionTree', 'isImmediateConnect'],
		},
	},
)
