import {
	type Connection,
	type PublishData,
	type Subscription,
	ConnectionStatusUpdateEventKey,
	ConnectionUpdateEventKey,
	DecodeMessageByEnum,
	SubscriptionUpdateEventKey,
	useConnectionsStore,
} from '@/store/modules/connections.ts'
import { isEmpty } from 'es-toolkit/compat'
import { useService } from 'electron-bridge-ipc/electron-sandbox'
import { type IMqttService, ChannelNameEnum } from '@/main/services/interface.ts'

const mqttService = useService<IMqttService>(ChannelNameEnum.Mqtt)

const [useProvideContent, useContent] = createInjectionState((clientId: Connection['clientId']) => {
	const connectionsStore = useConnectionsStore()

	//#region 连接
	const connection = ref<Connection>()
	const group = ref<Connection>()
	const connected = computed(() => connectionsStore.connectionStatus.get(clientId))

	function updateConnection() {
		connection.value = connectionsStore.getConnection(clientId)
		group.value = connection.value.parentClientId
			? connectionsStore.getConnection(connection.value.parentClientId)
			: null
	}
	updateConnection()

	useEventBus(ConnectionUpdateEventKey).on(() => {
		updateConnection()
	})
	//#endregion

	//#region 订阅
	const subscriptionTree = ref<Array<Subscription>>([])
	const subscriptionStatus = ref(new Map<Subscription['id'], boolean>())

	useEventBus(SubscriptionUpdateEventKey).on(updateSubscriptionTree)

	async function updateSubscriptionTree() {
		subscriptionTree.value = await connectionsStore.getSubscriptionTree(clientId)
		initSubscriptionStatus()
	}
	updateSubscriptionTree()

	async function subscribe(subscription: Subscription) {
		const { id } = subscription
		if (subscriptionStatus.value.get(id)) return
		const { success, message } = mqttService.subscribe(toRaw(subscription))
		if (!success && message) window.$message.error(message)
		subscriptionStatus.value.set(id, true)
		subscription.enabled = true
		connectionsStore.updateSubscription(subscription)
	}

	async function unsubscribe(subscription: Subscription) {
		const { id } = subscription
		if (subscriptionStatus.value.has(id) && !subscriptionStatus.value.get(id)) return
		const { success, message } = mqttService.unsubscribe(toRaw(subscription))
		if (!success && message) window.$message.error(message)
		subscriptionStatus.value.set(id, false)
		subscription.enabled = false
		connectionsStore.updateSubscription(subscription)
	}

	useEventBus(ConnectionStatusUpdateEventKey).on(res => {
		const { clientId: _clientId, connected: _connected } = res
		if (!_connected || clientId !== _clientId) return
		initSubscriptionStatus()
	})

	function initSubscriptionStatus() {
		subscriptionTree.value.forEach(node => {
			const init = _node => {
				const { enabled, id } = _node
				if (connected.value && enabled && (!subscriptionStatus.value.has(id) || !subscriptionStatus.value.get(id)))
					subscribe(_node)
			}
			init(node)
			node.children.forEach(init)
		})
	}

	//#endregion

	//#region 发布
	const publishData = ref<PublishData>({
		clientId: clientId,
		topic: '',
		message: '',
		options: {
			qos: 0,
			retain: false,
			dup: false,
			properties: {},
		},
	})
	const publishDataValidateRes = ref({ topic: true, message: true })
	const publishLoading = ref(false)

	function publishValidate() {
		const topic = !isEmpty(publishData.value.topic)
		const message = !isEmpty(publishData.value.message)
		publishDataValidateRes.value = { topic, message }
		return topic && message
	}

	async function publish() {
		try {
			publishLoading.value = true
			if (!publishValidate()) return
			const { success, message } = mqttService.publish(toRaw(publishData.value))
			if (!success) window.$message.error(message)
		} catch ({ message }) {
			window.$message.error(message)
		} finally {
			publishLoading.value = false
		}
	}
	//#endregion

	const decodeMessageBy = computed<DecodeMessageByEnum>({
		get() {
			return connection.value?.decodeMessageBy ?? DecodeMessageByEnum.Plaintext
		},
		set(value) {
			connection.value.decodeMessageBy = value
			connectionsStore.updateConnection(connection.value)
		},
	})
	const messages = computed(() =>
		connectionsStore.messages
			.filter(item => item.clientId === clientId)
			.map(item => {
				let subscription: Subscription
				const findSubscription = (node: Subscription) => {
					if (node.topic === item.topic) subscription = node
				}
				subscriptionTree.value.forEach(node => {
					if (node.isGroup) node.children?.forEach(findSubscription)
					else findSubscription(node)
				})
				return { ...item, subscriptionId: subscription?.id, color: subscription?.color }
			}),
	)

	return {
		clientId,
		connection,
		group,
		connected,
		subscriptionTree,
		subscriptionStatus,
		publishData,
		publishDataValidateRes,
		publishLoading,
		decodeMessageBy,
		messages,
		subscribe,
		unsubscribe,
		publishValidate,
		publish,
	}
})

export { useProvideContent, useContent }
