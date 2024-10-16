<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { Icon } from '@iconify/vue'
import { type AutoCompleteOption, type FormRules, type SelectOption } from 'naive-ui'
import { useConnectionsStore, type Connection } from '@/store/modules/connections'
import { cloneDeep } from 'es-toolkit'
import { nanoid } from 'nanoid'

const { t } = useI18n<{ message: MessageSchema }>()
const connectionStore = useConnectionsStore()

//#region 打开弹窗
const visible = ref(false)

function open() {
	visible.value = true
}

function close() {
	data.value = cloneDeep(defaultData)
	userProperties.value = []
}
//#endregion

const icon = () => <Icon icon="tabler:layers-linked" />

//#region 通用属性
const protocolOptions: Array<SelectOption> = [
	{ label: 'mqtts://', value: 'mqtts' },
	{ label: 'mqtt://', value: 'mqtt' },
	{ label: 'wss://', value: 'wss' },
	{ label: 'ws://', value: 'ws' },
]
enum CertificateKey {
	Ca,
	Self,
}
const caFileFormVisible = computed(() => data.value.ssl && data.value.certificate === CertificateKey.Self)
const caFileDialogLoading = ref({ ca: false, cert: false, key: false })

function generateClientId() {
	data.value.clientId = `naive_mqtt_${nanoid()}`
}

function handleCertificateUpdate(value: CertificateKey) {
	if (value === CertificateKey.Self) {
		data.value.caPaths = null
		data.value.certPath = null
		data.value.keyPath = null
	}
}

async function handleFilePickerClick(type: 'ca' | 'cert' | 'key') {
	try {
		caFileDialogLoading.value[type] = true
		const paths = await window.electronAPI.openFileDialog({})
		if (paths.length > 0) {
			const fieldNameMap = { ca: 'caPaths', cert: 'certPath', key: 'keyPath' }
			data.value[fieldNameMap[type]] = paths[0]
		}
	} finally {
		caFileDialogLoading.value[type] = false
	}
}
//#endregion

//#region 高级属性
const protocolVersionOptions: Array<SelectOption> = [
	{ label: '3.1', value: 3 },
	{ label: '3.1.1', value: 4 },
	{ label: '5.0', value: 5 },
]
const isMqtt5 = computed(() => data.value.protocolVersion === 5)
const userProperties = ref([])

function handleUserPropertiesCreate() {
	return { key: '', value: '' }
}
//#endregion

//#region 表单数据
const rules: FormRules = {
	name: { required: true },
	clientId: { required: true },
	hostname: { required: true },
}
const defaultData: Connection = {
	name: null,
	groupId: null,
	clientId: null,
	protocol: 'mqtts',
	hostname: null,
	port: null,
	username: null,
	password: null,
	ssl: false,
	rejectUnauthorized: true,
	ALPNProtocols: null,
	certificate: CertificateKey.Ca,
	caPaths: null,
	certPath: null,
	keyPath: null,
	protocolVersion: 5,
	connectTimeout: 10,
	keepalive: 60,
	manualConnect: true,
	reconnectPeriod: 4000,
	clean: true,
	properties: {
		sessionExpiryInterval: 0,
		receiveMaximum: null,
		maximumPacketSize: null,
		topicAliasMaximum: null,
		requestResponseInformation: null,
		requestProblemInformation: null,
		userProperties: {},
	},
	will: {
		topic: null,
		qos: 0,
		retain: false,
		payload: null,
		properties: {
			payloadFormatIndicator: false,
		},
	},
}
const data = ref(cloneDeep(defaultData))
//#endregion

//#region 模板
const templateList = ref<Array<Connection>>([])
const nameAutoCompleteOptions = computed<Array<AutoCompleteOption>>(() =>
	templateList.value.map(({ name, clientId }) => ({ label: name, key: clientId })),
)
onBeforeMount(async () => {
	const storeConnections = await connectionStore.getConnections()
	templateList.value = storeConnections || []
})
//#endregion

defineExpose({ open })
</script>

<template>
	<NModal
		v-model:show="visible"
		preset="dialog"
		:icon
		:title="t('connection.new_connection')"
		to=".main"
		:mask-closable="false"
		positive-text="保存"
		negative-text="取消"
		@after-leave="close()"
	>
		<OverlayScrollbar class="new-connections-dialog">
			<NForm size="small" label-placement="left" label-width="120" :rules :model="data">
				<NCollapse arrow-placement="right" display-directive="show" :default-expanded-names="['general']">
					<NCollapseItem :title="t('connection.new_connectionDialog.general.title')" name="general">
						<NFormItem :label="t('connection.new_connectionDialog.general.name')" path="name">
							<NAutoComplete v-model:value="data.name" :options="nameAutoCompleteOptions" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.clientId')" path="clientId">
							<NInputGroup>
								<NInput v-model:value="data.clientId" clearable />
								<NButton @click="generateClientId()">{{ t('common.generate') }}</NButton>
							</NInputGroup>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.host')" path="hostname">
							<NInputGroup>
								<NSelect v-model:value="data.protocol" style="width: 40%" :options="protocolOptions" />
								<NInput v-model:value="data.hostname" clearable />
							</NInputGroup>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.port')">
							<NInputNumber v-model:value="data.port" :min="0" :precision="0" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.username')">
							<NInput v-model:value="data.username" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.password')">
							<NInput v-model:value="data.password as string" clearable type="password" show-password-on="mousedown" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.ssl')">
							<NSwitch v-model:value="data.ssl" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.ssl_secure')" v-show="data.ssl">
							<NSwitch v-model:value="data.rejectUnauthorized" :checked-value="false" :unchecked-value="true" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.alpn')" v-show="data.ssl">
							<NInput v-model:value="data.ALPNProtocols as unknown as string" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.certificate')" v-show="data.ssl">
							<NRadioGroup v-model:value="data.certificate" name="certificate" @update:value="handleCertificateUpdate">
								<NRadio
									:label="t('connection.new_connectionDialog.general.ca_server_signed')"
									:value="CertificateKey.Ca"
								/>
								<NRadio
									:label="t('connection.new_connectionDialog.general.ca_self_signed')"
									:value="CertificateKey.Self"
								/>
							</NRadioGroup>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.ca_file')" v-show="caFileFormVisible">
							<NInputGroup>
								<NInput v-model:value="data.caPaths as string" clearable readonly placeholder="请选择文件" />
								<NButton :loading="caFileDialogLoading.ca" @click="handleFilePickerClick('ca')">
									{{ t('connection.new_connectionDialog.general.select_file') }}
								</NButton>
							</NInputGroup>
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connectionDialog.general.client_certificate_file')"
							label-width="150"
							v-show="caFileFormVisible"
						>
							<NInputGroup>
								<NInput v-model:value="data.certPath as string" clearable readonly placeholder="请选择文件" />
								<NButton :loading="caFileDialogLoading.cert" @click="handleFilePickerClick('ca')">
									{{ t('connection.new_connectionDialog.general.select_file') }}
								</NButton>
							</NInputGroup>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.general.client_key_file')" v-show="caFileFormVisible">
							<NInputGroup>
								<NInput v-model:value="data.keyPath as string" clearable readonly placeholder="请选择文件" />
								<NButton :loading="caFileDialogLoading.key" @click="handleFilePickerClick('ca')">
									{{ t('connection.new_connectionDialog.general.select_file') }}
								</NButton>
							</NInputGroup>
						</NFormItem>
					</NCollapseItem>
					<NCollapseItem :title="t('connection.new_connectionDialog.advanced.title')" name="advanced">
						<NFormItem :label="t('connection.new_connectionDialog.advanced.mqtt_version')">
							<NSelect v-model:value="data.protocolVersion" :options="protocolVersionOptions" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.connect_timeout')">
							<NInputNumber v-model:value="data.connectTimeout" :min="0">
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.keep_alive')">
							<NInputNumber v-model:value="data.keepalive" :min="0">
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.reconnect_period')">
							<NInputNumber v-model:value="data.reconnectPeriod" :min="0">
								<template #suffix>{{ t('common.milliseconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t(`connection.new_connectionDialog.advanced.clean_${isMqtt5 ? 'start' : 'session'}`)">
							<NSwitch v-model:value="data.clean" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.session_expiry_interval')" v-show="isMqtt5">
							<NInputNumber
								v-model:value="data.properties.sessionExpiryInterval"
								:min="0"
								:placeholder="t('connection.new_connectionDialog.advanced.never_expire')"
								clearable
							>
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.receive_maximum')">
							<NInputNumber v-model:value="data.properties.receiveMaximum" :min="1" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.maximum_packet_size')">
							<NInputNumber v-model:value="data.properties.maximumPacketSize" :min="100" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.topic_alias_maximum')">
							<NInputNumber v-model:value="data.properties.topicAliasMaximum" :min="1" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.request_response_info')">
							<NSwitch v-model:value="data.properties.requestResponseInformation" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.request_problem_info')">
							<NSwitch v-model:value="data.properties.requestProblemInformation" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.advanced.user_properties')">
							<NDynamicInput v-model:value="userProperties" @create="handleUserPropertiesCreate">
								<template #default="{ value }">
									<NInputGroup>
										<NInput
											v-model:value="value.key"
											:placeholder="t('connection.new_connectionDialog.advanced.key')"
											clearable
										/>
										<NInput
											v-model:value="value.value"
											:placeholder="t('connection.new_connectionDialog.advanced.value')"
											clearable
										/>
									</NInputGroup>
								</template>
							</NDynamicInput>
						</NFormItem>
					</NCollapseItem>
					<NCollapseItem
						:title="t('connection.new_connectionDialog.last_will_and_testament.title')"
						name="lastWillAndTestament"
					>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.topic')">
							<NInput v-model:value="data.will.topic" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.qos')">
							<QosSelect v-model:value="data.will.qos" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.retain')">
							<NSwitch v-model:value="data.will.retain" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.payload')">
							<NSelect v-model:value="data.protocolVersion" :options="protocolVersionOptions" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.payload_format_indicator')">
							<NSwitch v-model:value="data.will.properties.payloadFormatIndicator" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.will_delay_interval')">
							<NInputNumber v-model:value="data.will.properties.willDelayInterval" :min="0" clearable>
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.message_expiry_interval')">
							<NInputNumber v-model:value="data.will.properties.messageExpiryInterval" :min="0" clearable>
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.content_type')">
							<NInput v-model:value="data.will.properties.contentType" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.response_topic')">
							<NInput v-model:value="data.will.properties.responseTopic" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connectionDialog.last_will_and_testament.correlation_data')">
							<NInput v-model:value="data.will.properties.correlationData as unknown as string" clearable />
						</NFormItem>
					</NCollapseItem>
				</NCollapse>
			</NForm>
		</OverlayScrollbar>
	</NModal>
</template>

<style scoped lang="scss">
.new-connections-dialog {
	width: 70vw;
	height: 60vh;
	margin-top: 20px;
	padding: 0 26px;
}

:deep(.n-collapse-item__header) {
	position: sticky !important;
	top: 0;
	border-bottom: 1px solid var(--divider-color);
	padding: 16px 0 !important;
	background-color: var(--card-color);
	z-index: 2;
}

:deep(.n-collapse-item__header-main) {
	font-size: var(--font-size-large);
	color: var(--text-color-3) !important;
}

:deep(.n-collapse-item__content-wrapper) {
	margin-top: 8px;
	padding: 0px 16px;
	background-color: var(--action-color);
	border-radius: var(--border-radius);
}

:deep(.n-collapse-item) {
	border-top: none !important;
	margin: 0px;
}

:deep(.n-input-number) {
	width: 100%;
}
</style>
