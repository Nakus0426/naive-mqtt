import { type Connection, useConnectionsStore } from '@/store/modules/connections.ts'
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n.ts'
import { lowerFirst } from 'es-toolkit'

const [useProvideConnection, useConnection] = createInjectionState(() => {
	const { t } = useI18n<{ message: MessageSchema }>()
	const connectionsStore = useConnectionsStore()

	const selectedClientId = ref<Connection['clientId']>()

	const newConnectionDialogEventHook = createEventHook<{ type: 'new' | 'edit'; clientId?: Connection['clientId'] }>()

	const connectionDeleteConfirmEventHook = createEventHook<Connection['clientId']>()
	const connectionDeleteEventHook = createEventHook<Connection['clientId']>()
	connectionDeleteConfirmEventHook.on(clientId => {
		const connection = connectionsStore.getConnection(clientId)
		window.$dialog.warning({
			title: t('common.delete'),
			content: () =>
				h(
					'div',
					{ style: { padding: '20px 26px' } },
					{
						default: () =>
							t('common.delete_confirm', {
								name: lowerFirst(t(`connection.${connection.isGroup ? 'group' : 'connection'}`)),
							}),
					},
				),
			positiveText: t('common.confirm'),
			negativeText: t('common.cancel'),
			onPositiveClick: async () => {
				if (connectionsStore.connectionStatus.get(clientId)) await connectionsStore.disconnect(clientId)
				connectionsStore.deleteConnection(clientId as string)
				connectionDeleteEventHook.trigger(clientId)
			},
		})
	})

	return { selectedClientId, newConnectionDialogEventHook, connectionDeleteConfirmEventHook, connectionDeleteEventHook }
})

export { useProvideConnection, useConnection }
