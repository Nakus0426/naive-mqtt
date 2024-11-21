import {
	type Connection,
	ConnectionUpdateEventKey,
	Subscription,
	SubscriptionUpdateEventKey,
	useConnectionsStore,
} from '@/store/modules/connections.ts'

const [useProvideContent, useContent] = createInjectionState((clientId: Connection['clientId']) => {
	const connectionsStore = useConnectionsStore()

	//#region 连接
	const connection = ref()
	const group = ref()
	const connected = computed(() => connectionsStore.connectionStatus.get(clientId))

	function updateConnection() {
		connection.value = connectionsStore.getConnection(clientId)
		group.value = connection.value.parentClientId
			? connectionsStore.getConnection(connection.value.parentClientId)
			: null
	}
	updateConnection()

	useEventBus(ConnectionUpdateEventKey).on(() => updateConnection())
	//#endregion

	//#region 订阅
	const subscriptionTree = ref<Array<Subscription>>([])

	async function updateSubscriptionTree() {
		subscriptionTree.value = await connectionsStore.getSubscriptionTree(clientId)
	}
	updateSubscriptionTree()

	useEventBus(SubscriptionUpdateEventKey).on(() => updateSubscriptionTree())
	//#endregion

	return { clientId, connection, group, connected, subscriptionTree }
})

export { useProvideContent, useContent }
