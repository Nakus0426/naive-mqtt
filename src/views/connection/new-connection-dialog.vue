<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { Icon } from '@iconify/vue'
import { type DropdownOption, type AutoCompleteOption, type FormRules, type SelectOption } from 'naive-ui'
import { useConnectionsStore, type Connection } from '@/store/modules/connections'
import { type OnUpdateValueImpl as OnSelectUpdate } from 'naive-ui/es/select/src/interface'
import { type OnUpdateValueImpl as OnSwitchUpdate } from 'naive-ui/es/switch/src/interface'

const { t } = useI18n<{ message: MessageSchema }>()
const connectionStore = useConnectionsStore()
const icon = () => <Icon icon="tabler:layers-linked" />

//#region 打开弹窗
const visible = ref(false)
const edit = ref(false)

function open(clientId?: Connection['clientId']) {
	if (clientId) {
		edit.value = true
		data.value = structuredClone(toRaw(connectionStore.getConnection(clientId)))
	}
	visible.value = true
}

function close() {
	data.value = structuredClone(defaultData)
	edit.value = false
	userProperties.value = []
}
//#endregion

//#region 表单标签
const formLabelMap = {
	name: 'connection.new_connection_dialog.general.name',
	clientId: 'connection.new_connection_dialog.general.clientId',
	host: 'connection.new_connection_dialog.general.host',
	port: 'connection.new_connection_dialog.general.port',
	path: 'connection.new_connection_dialog.general.path',
}

function generateFormLabel(label: keyof typeof formLabelMap) {
	return t(formLabelMap[label])
}
//#endregion

//#region 通用属性
function generateClientId() {
	data.value.clientId = connectionStore.generateClientId()
}

const isProtocolWs = computed(() => data.value.protocol === 'ws' || data.value.protocol === 'wss')
const protocolOptions: Array<SelectOption> = [
	{ label: 'mqtts://', value: 'mqtts' },
	{ label: 'mqtt://', value: 'mqtt' },
	{ label: 'wss://', value: 'wss' },
	{ label: 'ws://', value: 'ws' },
]

const handleProtocolUpdate: OnSelectUpdate = value => {
	const ssl = value === 'mqtts' || value === 'wss'
	data.value.ssl = ssl
	handleSSLUpdate(ssl)
}

const handleSSLUpdate: OnSwitchUpdate = value => {
	data.value.certificate = value ? CertificateKeyEnum.Ca : CertificateKeyEnum.Self
	if (/ws/gi.test(data.value.protocol)) data.value.protocol = value ? 'wss' : 'ws'
	else if (/mqtt/gi.test(data.value.protocol)) data.value.protocol = value ? 'mqtts' : 'mqtt'
}

enum CertificateKeyEnum {
	Ca,
	Self,
}
const caFileFormVisible = computed(() => data.value.ssl && data.value.certificate === CertificateKeyEnum.Self)
const caFileDialogLoading = ref({ ca: false, cert: false, key: false })

function handleCertificateUpdate(value: CertificateKeyEnum) {
	if (value === CertificateKeyEnum.Self) {
		data.value.caPaths = null
		data.value.certPath = null
		data.value.keyPath = null
	}
}

async function handleFilePickerClick(type: 'ca' | 'cert' | 'key') {
	try {
		caFileDialogLoading.value[type] = true
		const paths = await window.electronAPI.openFileDialog({
			properties: ['openFile'],
			filters: [{ name: 'CA', extensions: ['crt', 'key', 'pem', 'jks', 'der', 'cer', 'pfx'] }],
		})
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

const handleCleanUpdate: OnSwitchUpdate = value => {
	if (!isMqtt5.value) return
	data.value.properties.sessionExpiryInterval = value ? 0 : 7200
}

const userProperties = ref([])

function handleUserPropertiesCreate() {
	return { key: '', value: '' }
}
//#endregion

//#region 表单数据
const rules = computed<FormRules>(() => ({
	name: { required: true, message: t('common.input_required', { name: generateFormLabel('name') }) },
	clientId: { required: true, message: t('common.input_required', { name: generateFormLabel('clientId') }) },
	hostname: { required: true, message: t('common.input_required', { name: generateFormLabel('host') }) },
	port: { required: true, message: t('common.input_required', { name: generateFormLabel('port') }) },
	path: { required: isProtocolWs.value, message: t('common.input_required', { name: generateFormLabel('path') }) },
}))
const defaultData: Connection = {
	name: null,
	parentClientId: null,
	isGroup: false,
	children: [],
	clientId: null,
	protocol: 'mqtt',
	hostname: null,
	port: null,
	username: null,
	password: null,
	ssl: false,
	rejectUnauthorized: true,
	ALPNProtocols: null,
	certificate: CertificateKeyEnum.Ca,
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
			willDelayInterval: null,
			messageExpiryInterval: null,
			contentType: null,
			responseTopic: null,
			correlationData: null,
		},
	},
}
const data = ref(structuredClone(defaultData))
//#endregion

//#region 模板
const templateList = ref<Array<Connection>>([])
const nameAutoCompleteOptions = computed<Array<AutoCompleteOption>>(() =>
	templateList.value.map(({ name, clientId }) => ({ label: name, key: clientId })),
)
onBeforeMount(async () => {})
//#endregion

//#region 保存
const formRef = useTemplateRef('form')
enum SaveModeEnum {
	SaveAndConnect,
	SaveOnly,
}
const saveMode = computed({
	get() {
		return connectionStore.isImmediateConnect ? SaveModeEnum.SaveAndConnect : SaveModeEnum.SaveOnly
	},
	set(value) {
		connectionStore.isImmediateConnect = value === SaveModeEnum.SaveAndConnect
	},
})
const saveModeOptions = computed<Array<DropdownOption>>(() => [
	{ label: t('connection.new_connection_dialog.save_and_connect'), value: SaveModeEnum.SaveAndConnect },
	{ label: t('connection.new_connection_dialog.save_only'), value: SaveModeEnum.SaveOnly },
])

async function submit() {
	await formRef.value.validate()
	edit.value ? connectionStore.updateConnection(data.value) : connectionStore.newConnection(data.value)
	visible.value = false
}
//#endregion

defineExpose({ open })
</script>

<template>
	<NModal
		v-model:show="visible"
		preset="dialog"
		:icon
		:title="t(`connection.${edit ? 'edit' : 'new'}_connection`)"
		to=".main"
		:auto-focus="false"
		:mask-closable="false"
		:close-on-esc="false"
		@after-leave="close()"
	>
		<OverlayScrollbar class="new-connections-dialog">
			<NForm size="small" label-placement="left" label-width="120" :rules :model="data" ref="form">
				<NCollapse arrow-placement="right" display-directive="show" :default-expanded-names="['general']">
					<NCollapseItem :title="t('connection.new_connection_dialog.general.title')" name="general">
						<NFormItem :label="generateFormLabel('name')" path="name">
							<NInput v-model:value.trim="data.name" clearable v-if="edit" />
							<NAutoComplete v-model:value="data.name" :options="nameAutoCompleteOptions" clearable v-else />
						</NFormItem>
						<NFormItem :label="generateFormLabel('clientId')" path="clientId">
							<NInputGroup>
								<NInput v-model:value="data.clientId" clearable />
								<NButton @click="generateClientId()">{{ t('common.generate') }}</NButton>
							</NInputGroup>
						</NFormItem>
						<NFormItem :label="generateFormLabel('host')" path="hostname">
							<NInputGroup>
								<NSelect
									v-model:value="data.protocol"
									style="width: 40%"
									:options="protocolOptions"
									@update:value="handleProtocolUpdate"
								/>
								<NInput v-model:value.trim="data.hostname" clearable />
							</NInputGroup>
						</NFormItem>
						<NFormItem :label="generateFormLabel('port')" path="port">
							<NInputNumber v-model:value="data.port" :min="0" :max="65535" :precision="0" clearable />
						</NFormItem>
						<NFormItem :label="generateFormLabel('path')" path="path" v-show="isProtocolWs">
							<NInput v-model:value.trim="data.path" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.general.username')">
							<NInput v-model:value.trim="data.username" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.general.password')">
							<NInput
								v-model:value.trim="data.password as string"
								clearable
								type="password"
								show-password-on="mousedown"
							/>
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.general.ssl')">
							<NSwitch v-model:value="data.ssl" @update:value="handleSSLUpdate" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.general.ssl_secure')" v-show="data.ssl">
							<NSwitch v-model:value="data.rejectUnauthorized" :checked-value="false" :unchecked-value="true" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.general.alpn')" v-show="data.ssl">
							<NInput v-model:value.trim="data.ALPNProtocols as unknown as string" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.general.certificate')" v-show="data.ssl">
							<NRadioGroup v-model:value="data.certificate" name="certificate" @update:value="handleCertificateUpdate">
								<NRadio
									:label="t('connection.new_connection_dialog.general.ca_server_signed')"
									:value="CertificateKeyEnum.Ca"
								/>
								<NRadio
									:label="t('connection.new_connection_dialog.general.ca_self_signed')"
									:value="CertificateKeyEnum.Self"
								/>
							</NRadioGroup>
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.general.ca_file')" v-show="caFileFormVisible">
							<NInputGroup>
								<NInput v-model:value="data.caPaths as string" clearable readonly placeholder="请选择文件" />
								<NButton :loading="caFileDialogLoading.ca" @click="handleFilePickerClick('ca')">
									{{ t('connection.new_connection_dialog.general.select_file') }}
								</NButton>
							</NInputGroup>
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connection_dialog.general.client_certificate_file')"
							v-show="caFileFormVisible"
						>
							<NInputGroup>
								<NInput v-model:value="data.certPath as string" clearable readonly placeholder="请选择文件" />
								<NButton :loading="caFileDialogLoading.cert" @click="handleFilePickerClick('cert')">
									{{ t('connection.new_connection_dialog.general.select_file') }}
								</NButton>
							</NInputGroup>
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connection_dialog.general.client_key_file')"
							v-show="caFileFormVisible"
						>
							<NInputGroup>
								<NInput v-model:value="data.keyPath as string" clearable readonly placeholder="请选择文件" />
								<NButton :loading="caFileDialogLoading.key" @click="handleFilePickerClick('key')">
									{{ t('connection.new_connection_dialog.general.select_file') }}
								</NButton>
							</NInputGroup>
						</NFormItem>
					</NCollapseItem>
					<NCollapseItem :title="t('connection.new_connection_dialog.advanced.title')" name="advanced">
						<NFormItem :label="t('connection.new_connection_dialog.advanced.mqtt_version')">
							<NSelect v-model:value="data.protocolVersion" :options="protocolVersionOptions" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.connect_timeout')">
							<NInputNumber v-model:value="data.connectTimeout" :min="0">
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.keep_alive')">
							<NInputNumber v-model:value="data.keepalive" :min="0">
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.reconnect_period')">
							<NInputNumber v-model:value="data.reconnectPeriod" :min="1">
								<template #suffix>{{ t('common.milliseconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t(`connection.new_connection_dialog.advanced.clean_${isMqtt5 ? 'start' : 'session'}`)">
							<NSwitch v-model:value="data.clean" @update:value="handleCleanUpdate" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.session_expiry_interval')" v-show="isMqtt5">
							<NInputNumber v-model:value="data.properties.sessionExpiryInterval" :min="0" clearable>
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.receive_maximum')">
							<NInputNumber v-model:value="data.properties.receiveMaximum" :min="1" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.maximum_packet_size')">
							<NInputNumber v-model:value="data.properties.maximumPacketSize" :min="100" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.topic_alias_maximum')">
							<NInputNumber v-model:value="data.properties.topicAliasMaximum" :min="1" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.request_response_info')">
							<NSwitch v-model:value="data.properties.requestResponseInformation" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.request_problem_info')">
							<NSwitch v-model:value="data.properties.requestProblemInformation" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.advanced.user_properties')">
							<NDynamicInput v-model:value="userProperties" @create="handleUserPropertiesCreate">
								<template #default="{ value }">
									<NInputGroup>
										<NInput
											v-model:value="value.key"
											:placeholder="t('connection.new_connection_dialog.advanced.key')"
											clearable
										/>
										<NInput
											v-model:value="value.value"
											:placeholder="t('connection.new_connection_dialog.advanced.value')"
											clearable
										/>
									</NInputGroup>
								</template>
							</NDynamicInput>
						</NFormItem>
					</NCollapseItem>
					<NCollapseItem
						:title="t('connection.new_connection_dialog.last_will_and_testament.title')"
						name="lastWillAndTestament"
					>
						<NFormItem :label="t('connection.new_connection_dialog.last_will_and_testament.topic')">
							<NInput v-model:value="data.will.topic" clearable />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.last_will_and_testament.qos')">
							<QosSelect v-model:value="data.will.qos" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.last_will_and_testament.retain')">
							<NSwitch v-model:value="data.will.retain" />
						</NFormItem>
						<NFormItem :label="t('connection.new_connection_dialog.last_will_and_testament.payload')">
							<Editor class="payload-editor" v-model:value="data.will.payload" />
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connection_dialog.last_will_and_testament.payload_format_indicator')"
							v-show="isMqtt5"
						>
							<NSwitch v-model:value="data.will.properties.payloadFormatIndicator" />
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connection_dialog.last_will_and_testament.will_delay_interval')"
							v-show="isMqtt5"
						>
							<NInputNumber v-model:value="data.will.properties.willDelayInterval" :min="0" clearable>
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connection_dialog.last_will_and_testament.message_expiry_interval')"
							v-show="isMqtt5"
						>
							<NInputNumber v-model:value="data.will.properties.messageExpiryInterval" :min="0" clearable>
								<template #suffix>{{ t('common.seconds') }}</template>
							</NInputNumber>
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connection_dialog.last_will_and_testament.content_type')"
							v-show="isMqtt5"
						>
							<NInput v-model:value="data.will.properties.contentType" clearable />
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connection_dialog.last_will_and_testament.response_topic')"
							v-show="isMqtt5"
						>
							<NInput v-model:value="data.will.properties.responseTopic" clearable />
						</NFormItem>
						<NFormItem
							:label="t('connection.new_connection_dialog.last_will_and_testament.correlation_data')"
							v-show="isMqtt5"
						>
							<NInput v-model:value="data.will.properties.correlationData as unknown as string" clearable />
						</NFormItem>
					</NCollapseItem>
				</NCollapse>
			</NForm>
		</OverlayScrollbar>
		<template #action>
			<NFlex>
				<NButton size="small" @click="visible = false">{{ t('common.cancel') }}</NButton>
				<NButtonGroup>
					<NButton type="primary" size="small" @click="submit()">{{ t('common.save') }}</NButton>
					<NPopselect v-model:value="saveMode" :options="saveModeOptions" size="small" placement="top-end">
						<NButton type="primary" size="small" style="width: 30px">
							<template #icon>
								<Icon icon="tabler:chevron-up" />
							</template>
						</NButton>
					</NPopselect>
				</NButtonGroup>
			</NFlex>
		</template>
	</NModal>
</template>

<style scoped lang="scss">
.new-connections-dialog {
	width: 70vw;
	height: 60vh;
	padding: 0 26px;
}

:deep(.n-collapse-item__header) {
	position: sticky !important;
	top: 0;
	border-bottom: 1px solid var(--divider-color);
	padding: 16px 0 !important;
	background-color: var(--card-color);
	z-index: 12;
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

.payload-editor {
	height: 400px;
	width: 500px;
}
</style>
