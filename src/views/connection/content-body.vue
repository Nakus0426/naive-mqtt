<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { useConnectionsStore } from '@/store/modules/connections'
import { useContent } from './use-content'
import PublishSetting from './publish-setting.vue'
import Message from './message.vue'
import { NFlex, NPopselect, type SelectOption } from 'naive-ui'
import { type RenderLabelImpl as SelectMenuLabelRender } from 'naive-ui/es/_internal/select-menu/src/interface'
import { Icon } from '@iconify/vue'

const { t } = useI18n<{ message: MessageSchema }>()
const connectionsStore = useConnectionsStore()
const { publishData, publishDataValidateRes, publish: publishFunc } = useContent()

enum DecodeMessageByEnum {
	Plaintext = 'Plaintext',
	JSON = 'Json',
	Base64 = 'Base64',
	Hex = 'Hex',
	CBOR = 'CBOR',
	MsgPack = 'MsgPack',
}
const decodeMessageByPopselectOptions = computed<Array<SelectOption>>(() =>
	Object.keys(DecodeMessageByEnum).map(key => ({ label: key, value: DecodeMessageByEnum[key] })),
)
const decodeMessageBy = ref(DecodeMessageByEnum.Plaintext)
const decodeMessageByPopselectVisible = ref(false)

//#region 消息类型
enum MessageTypeEnum {
	All = 'connection.message_type_options.all',
	Published = 'connection.message_type_options.published',
	Received = 'connection.message_type_options.received',
}
const messageTypePopselectOptions = computed<Array<SelectOption>>(() =>
	Object.values(MessageTypeEnum).map(value => ({ label: t(value), value })),
)
const messageTypePopselectLabelRender: SelectMenuLabelRender = option => {
	const iconMap = {
		[MessageTypeEnum.All]: 'tabler:message',
		[MessageTypeEnum.Published]: 'tabler:message-up',
		[MessageTypeEnum.Received]: 'tabler:message-down',
	}
	return (
		<NFlex align="center" size="small">
			<Icon icon={iconMap[option.value as MessageTypeEnum]} height="14" width="14" />
			<span>{option.label}</span>
		</NFlex>
	)
}
const messageType = ref(MessageTypeEnum.All)
const messageTypePopselectVisible = ref(false)
//#endregion

//#region footer高度
const footerHeight = computed(() => `${connectionsStore.contentFooterHeight}px`)
const footerResizing = ref(false)

function handleFooterDrag({ clientY }: MouseEvent) {
	footerResizing.value = true
	const startY = clientY
	const initialWidth = connectionsStore.contentFooterHeight
	const onMouseMove = ({ clientY: _clientY }: MouseEvent) => {
		if (!footerResizing) return

		const diffY = startY - _clientY
		connectionsStore.contentFooterHeight = Math.max(100, initialWidth + diffY)
	}
	const endResize = () => {
		footerResizing.value = false
		document.removeEventListener('mousemove', onMouseMove)
		document.removeEventListener('mouseup', endResize)
	}
	document.addEventListener('mousemove', onMouseMove)
	document.addEventListener('mouseup', endResize)
}
//#endregion

//#region 发布消息
function publish() {
	publishFunc()
}
//#endregion
</script>

<template>
	<div class="content-body">
		<div class="body">
			<div class="body_header">
				<NPopselect
					trigger="click"
					size="small"
					v-model:value="decodeMessageBy"
					v-model:show="decodeMessageByPopselectVisible"
					:options="decodeMessageByPopselectOptions"
				>
					<NTooltip :disabled="decodeMessageByPopselectVisible">
						<template #trigger>
							<NButton quaternary size="tiny">
								{{ decodeMessageBy }}
							</NButton>
						</template>
						{{ t('connection.decode_message_by') }}
					</NTooltip>
				</NPopselect>
				<NPopselect
					trigger="click"
					size="small"
					v-model:value="messageType"
					v-model:show="messageTypePopselectVisible"
					:options="messageTypePopselectOptions"
					:render-label="messageTypePopselectLabelRender"
				>
					<NTooltip :disabled="messageTypePopselectVisible">
						<template #trigger>
							<NButton quaternary size="tiny">
								{{ t(messageType) }}
							</NButton>
						</template>
						{{ t('connection.message_type') }}
					</NTooltip>
				</NPopselect>
			</div>
			<NVirtualList
				class="body_content"
				item-resizable
				:item-size="63"
				:items="Array.from({ length: 100 }).map(() => ({ id: Math.random() }))"
			>
				<template #default="{ item }">
					<Message content="" />
				</template>
			</NVirtualList>
		</div>
		<div class="footer" :resizing="footerResizing" :collapse="connectionsStore.contentFooterCollapsed">
			<button
				class="footer_collapse"
				@click="connectionsStore.contentFooterCollapsed = !connectionsStore.contentFooterCollapsed"
			>
				<Icon height="18" width="18" icon="tabler:chevron-down" />
			</button>
			<div class="footer_drag" @mousedown="handleFooterDrag" />
			<div class="footer_header">
				<NInput
					size="small"
					clearable
					:placeholder="t('common.input_required', { name: t('connection.new_subscription_dialog.topic') })"
					v-model:value="publishData.topic"
					:status="publishDataValidateRes.topic ? undefined : 'error'"
				/>
				<PublishSetting />
			</div>
			<Editor class="footer_body" v-model:value="publishData.message" :error="!publishDataValidateRes.message" />
			<NTooltip>
				<template #trigger>
					<NButton class="footer_send" type="primary" circle @click="publish()">
						<template #icon>
							<Icon icon="tabler:send-2" />
						</template>
					</NButton>
				</template>
				{{ t('connection.publish') }}
			</NTooltip>
		</div>
	</div>
</template>

<style scoped lang="scss">
.content-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: var(--card-color);
	border-radius: var(--border-radius);
	border: 1px solid var(--border-color);
	overflow: hidden;
}

.body {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	&_header {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid var(--border-color);
		padding: 4px 8px;
	}

	&_content {
		flex: 1;
		padding: 0 8px;
	}
}

.footer {
	display: flex;
	flex-direction: column;
	position: relative;
	height: v-bind(footerHeight);
	max-height: v-bind(footerHeight);
	border-top: 1px solid var(--border-color);
	transition: all 0.2s var(--cubic-bezier-ease-in-out);
	z-index: 1;

	&[collapse='true'] {
		max-height: 0;

		.footer_collapse {
			transform: translate(-50%, -100%);

			svg {
				transform: rotate(180deg);
			}
		}

		.footer_drag {
			pointer-events: none;
		}
	}

	&[resizing='true'] {
		transition: none;
	}

	&_collapse {
		position: absolute;
		top: -11px;
		left: 50%;
		height: 22px;
		width: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translateX(-50%);
		border-radius: 12px;
		border: 1px solid var(--border-color);
		cursor: pointer;
		background-color: var(--card-color);
		padding: 0;
		color: var(--text-color-3);
		transition: all 0.2s var(--cubic-bezier-ease-in-out);
		z-index: 2;

		&:hover {
			box-shadow: var(--box-shadow-1);
			color: var(--text-color-2);
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			border-radius: 12px;
			z-index: 1;
			transition: all 0.2s var(--cubic-bezier-ease-in-out);
		}

		svg {
			z-index: 2;
			transition: all 0.2s;
		}
	}

	&_drag {
		position: absolute;
		top: -2px;
		left: 0;
		right: 0;
		height: 4px;
		cursor: n-resize;
		transition: all 0.2s var(--cubic-bezier-ease-in-out);

		&:hover {
			background-color: var(--primary-color);
		}
	}

	&_header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		border-bottom: 1px solid var(--border-color);

		:deep(.n-input__border) {
			border: none;
		}
	}

	&_body {
		flex: 1;
		border-bottom-right-radius: var(--border-radius);
		border-bottom-left-radius: var(--border-radius);
		border: 1px solid transparent;
		transition: all 0.2s var(--cubic-bezier-ease-in-out);

		&[error='true'] {
			border-color: var(--error-color);
		}
	}

	&_send {
		position: absolute;
		right: 8px;
		bottom: 38px;
		box-shadow: var(--box-shadow-1);
	}
}
</style>
