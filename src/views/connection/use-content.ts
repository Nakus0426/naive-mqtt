import { type Connection, useConnectionsStore } from '@/store/modules/connections.ts'

const [useProvideContent, useContent] = createInjectionState((clientId: Connection['clientId']) => {
	const connectionsStore = useConnectionsStore()

	const connection = computed(() => connectionsStore.getConnection(clientId))
	const group = computed(() =>
		connection.value.parentClientId ? connectionsStore.getConnection(connection.value.parentClientId) : null,
	)
	const connected = computed(() => connectionsStore.connectionStatus.get(clientId))

	return { connection, group, connected }
})

export { useProvideContent, useContent }
