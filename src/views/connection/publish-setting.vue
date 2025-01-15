<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { Icon } from '@iconify/vue'
import QosSelect from '@/components/qos-select.vue'
import { useContent } from './use-content'

const { t } = useI18n<{ message: MessageSchema }>()
const { connection, publishData } = useContent()

const visible = ref(false)
const icon = () => <Icon icon="tabler:settings" />

const [DefineItem, Item] = createReusableTemplate<{ label: string }>()

const userProperties = ref([])

function handleUserPropertiesCreate() {
	return { key: '', value: '' }
}
</script>

<template>
	<DefineItem v-slot="{ label, $slots }">
		<div class="item">
			<div class="item_label">{{ label }}</div>
			<div class="item_value">
				<component :is="$slots.default" />
			</div>
		</div>
	</DefineItem>
	<NTooltip>
		<template #trigger>
			<NButton size="small" quaternary @click="visible = true">
				<template #icon>
					<Icon height="14" width="14" icon="tabler:dots-vertical" />
				</template>
			</NButton>
		</template>
		{{ t('connection.publish_setting') }}
	</NTooltip>
	<NModal
		preset="dialog"
		to=".main"
		:title="t('connection.publish_setting')"
		:icon
		:auto-focus="false"
		:mask-closable="false"
		:close-on-esc="false"
		v-model:show="visible"
	>
		<OverlayScrollbar class="publish-setting">
			<Item :label="t('connection.new_subscription_dialog.qos')">
				<QosSelect size="small" v-model:value="publishData.options.qos" />
			</Item>
			<Item :label="t('connection.new_connection_dialog.last_will_and_testament.retain')">
				<NSwitch v-model:value="publishData.options.retain" />
			</Item>
			<Item :label="t('connection.publish_setting_dialog.dup')">
				<NSwitch v-model:value="publishData.options.dup" />
			</Item>
			<template v-if="connection.protocolVersion === 5">
				<Item :label="t('connection.new_connection_dialog.last_will_and_testament.payload_format_indicator')">
					<NSwitch v-model:value="publishData.options.properties.payloadFormatIndicator" />
				</Item>
				<Item :label="t('connection.new_connection_dialog.last_will_and_testament.message_expiry_interval')">
					<NInputNumber
						clearable
						size="small"
						v-model:value="publishData.options.properties.messageExpiryInterval"
						:min="0"
					>
						<template #suffix>{{ t('common.seconds') }}</template>
					</NInputNumber>
				</Item>
				<Item :label="t('connection.publish_setting_dialog.topic_alias')">
					<NInputNumber size="small" v-model:value="publishData.options.properties.topicAlias" />
				</Item>
				<Item :label="t('connection.new_connection_dialog.last_will_and_testament.response_topic')">
					<NInput clearable size="small" v-model:value="publishData.options.properties.responseTopic" />
				</Item>
				<Item :label="t('connection.new_connection_dialog.last_will_and_testament.correlation_data')">
					<NInput
						clearable
						size="small"
						v-model:value="publishData.options.properties.correlationData as unknown as string"
					/>
				</Item>
				<Item :label="t('connection.publish_setting_dialog.subscription_identifier')">
					<NInputNumber size="small" v-model:value="publishData.options.properties.subscriptionIdentifier as number" />
				</Item>
				<Item :label="t('connection.new_connection_dialog.last_will_and_testament.content_type')">
					<NInput clearable size="small" v-model:value="publishData.options.properties.contentType" />
				</Item>
				<Item :label="t('connection.new_connection_dialog.advanced.user_properties')">
					<NDynamicInput
						v-model:value="userProperties"
						:create-button-props="{ size: 'small' }"
						@create="handleUserPropertiesCreate"
					>
						<template #default="{ value }">
							<NInputGroup>
								<NInput
									clearable
									size="small"
									v-model:value="value.key"
									:placeholder="t('connection.new_connection_dialog.advanced.key')"
								/>
								<NInput
									clearable
									size="small"
									v-model:value="value.value"
									:placeholder="t('connection.new_connection_dialog.advanced.value')"
								/>
							</NInputGroup>
						</template>
						<template #action="{ create, remove, index }">
							<NButtonGroup class="user-properties_action" size="small">
								<NButton type="success" tertiary @click="create(index)">
									<template #icon>
										<Icon icon="tabler:plus" />
									</template>
								</NButton>
								<NButton type="error" tertiary @click="remove(index)">
									<template #icon>
										<Icon icon="tabler:trash" />
									</template>
								</NButton>
							</NButtonGroup>
						</template>
					</NDynamicInput>
				</Item>
			</template>
		</OverlayScrollbar>
	</NModal>
</template>

<style scoped lang="scss">
.publish-setting {
	width: 70vw;
	height: 60vh;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-auto-rows: min-content;
	grid-gap: 10px;
	padding: 0 26px;
	margin-top: 20px;
}

.item {
	display: flex;
	flex-direction: column;
	gap: 10px;
	background-color: var(--action-color);
	border-radius: var(--border-radius);
	padding: 10px;

	&:nth-last-child(3) {
		margin-bottom: 20px;
		grid-column-start: 1;
		grid-column-end: 3;
	}

	.user-properties_action {
		margin-left: 10px;
	}
}
</style>
