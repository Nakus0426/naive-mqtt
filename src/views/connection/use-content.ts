import {
	type Connection,
	type PublishData,
	type Subscription,
	ConnectionUpdateEventKey,
	SubscriptionUpdateEventKey,
	useConnectionsStore,
} from '@/store/modules/connections.ts'
import { isEmpty } from 'es-toolkit/compat'

export enum DecodeMessageByEnum {
	Plaintext = 'Plaintext',
	JSON = 'Json',
	Base64 = 'Base64',
	Hex = 'Hex',
	CBOR = 'CBOR',
	MsgPack = 'MsgPack',
}

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
		initSubscriptionStatus()
	})
	//#endregion

	//#region 订阅
	const subscriptionTree = ref<Array<Subscription>>([])
	const subscriptionStatus = ref(new Map<Subscription['id'], boolean>())

	useEventBus(SubscriptionUpdateEventKey).on(() => updateSubscriptionTree())

	async function updateSubscriptionTree() {
		subscriptionTree.value = await connectionsStore.getSubscriptionTree(clientId)
	}
	updateSubscriptionTree()

	async function subscribe(subscription: Subscription) {
		if (subscriptionStatus.value.get(subscription.id)) return
		await window.electronAPI.mqttSubscribe(subscription)
		subscriptionStatus.value.set(subscription.id, true)
		subscription.enabled = true
		connectionsStore.updateSubscription(subscription)
	}

	async function unsubscribe(subscription: Subscription) {
		if (!subscriptionStatus.value.get(subscription.id)) return
		await window.electronAPI.mqttUnsubscribe(subscription)
		subscriptionStatus.value.set(subscription.id, false)
		subscription.enabled = false
		connectionsStore.updateSubscription(subscription)
	}

	function initSubscriptionStatus() {
		subscriptionTree.value.forEach(node => {
			node.enabled && !subscriptionStatus.value.get(node.id) && subscribe(node)
			node.children.forEach(child => child.enabled && !subscriptionStatus.value.get(child.id) && subscribe(child))
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
			const { success, message } = await window.electronAPI.mqttPublish(toRaw(publishData.value))
			if (!success) window.$message.error(message)
		} catch ({ message }) {
			window.$message.error(message)
		} finally {
			publishLoading.value = false
		}
	}
	//#endregion

	const decodeMessageBy = ref(DecodeMessageByEnum.Plaintext)

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
		subscribe,
		unsubscribe,
		publishValidate,
		publish,
	}
})

export { useProvideContent, useContent }
