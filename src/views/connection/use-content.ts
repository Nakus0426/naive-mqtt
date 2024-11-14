import { type Connection, ConnectionUpdateEventKey, useConnectionsStore } from '@/store/modules/connections.ts'

const [useProvideContent, useContent] = createInjectionState((clientId: Connection['clientId']) => {
	const connectionsStore = useConnectionsStore()

	const connection = ref()
	const group = ref()
	const connected = computed(() => connectionsStore.connectionStatus.get(clientId))

	function updateData() {
		connection.value = connectionsStore.getConnection(clientId)
		group.value = connection.value.parentClientId
			? connectionsStore.getConnection(connection.value.parentClientId)
			: null
	}
	updateData()

	useEventBus(ConnectionUpdateEventKey).on(_clientId => updateData())

	return { connection, group, connected }
})

export { useProvideContent, useContent }
