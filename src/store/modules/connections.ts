import { defineStore } from 'pinia'
import { getItem, setItem } from 'localforage'
import { type CreateClientOptions } from '@/main/mqtt.ts'
import { TreeOption } from 'naive-ui'

enum StoreKey {
	GROUPS = 'groups',
	CONNECTIONS = 'connections',
}

export type Group = { id: string; name: string }

export type Connection = { name: string; groupId: Group['id'] } & CreateClientOptions

/**
 * 连接
 */
export const useConnectionsStore = defineStore('CONNECTIONS', () => {
	function getGroups() {
		return getItem<Array<Group>>(StoreKey.GROUPS)
	}

	function getConnections() {
		return getItem<Array<Connection>>(StoreKey.CONNECTIONS)
	}

	async function getConnectionsTree() {
		const groups = await getGroups()
		const connections = await getConnections()
		const generateConnectionTree = (value: Array<Connection>) =>
			value.map<TreeOption>(item => ({ label: item.name, key: item.clientId, isLeaf: true, data: item }))
		return groups.length === 0
			? generateConnectionTree(connections)
			: groups.map<TreeOption>(({ id, name }) => ({
					label: name,
					key: id,
					children: generateConnectionTree(connections.filter(({ groupId }) => groupId === id)),
				}))
	}

	async function newConnection(value: Connection) {
		const connections = await getConnections()
		connections.push(value)
		await setItem(StoreKey.CONNECTIONS, connections)
	}

	async function newGroup(value: Group) {
		const groups = await getGroups()
		groups.push(value)
		await setItem(StoreKey.GROUPS, groups)
	}

	return {
		getConnections,
		getGroups,
		getConnectionsTree,
		newConnection,
		newGroup,
	}
})
