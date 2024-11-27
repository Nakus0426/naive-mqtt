<script setup lang="ts">
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { editor } from 'monaco-editor'
import { useAppStore } from '@/store/modules/app'
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'

const { languages = ['plaintext', 'json'], value } = defineProps<{
	value?: string
	languages?: Array<string>
}>()
const language = defineModel<'plaintext' | 'json'>({ default: 'plaintext' })
const emit = defineEmits<{ 'update:value': [string] }>()
const appStore = useAppStore()
const { t } = useI18n<{ message: MessageSchema }>()

// @ts-ignore
self.MonacoEnvironment = {
	getWorker(_workerId: any, label: string) {
		if (label === 'json') return new JsonWorker()
		return new EditorWorker()
	},
}

const bodyRef = useTemplateRef('body')
let editorInstance: editor.IStandaloneCodeEditor

//#region 初始化
function init() {
	editorInstance = editor.create(bodyRef.value, {
		automaticLayout: true,
		minimap: { enabled: false },
		theme: appStore.isDarkTheme ? 'vs-dark' : 'vs',
		language: language.value,
		renderLineHighlight: 'none',
		fontFamily: 'JetBrainsMono-Regular, HarmonyOS_Sans_Regular',
		fontSize: 13,
		fixedOverflowWidgets: true,
		overviewRulerBorder: false,
		scrollbar: {
			horizontalScrollbarSize: 10,
			verticalScrollbarSize: 10,
			horizontalSliderSize: 4,
			verticalSliderSize: 4,
		},
	})
	editorInstance.onDidChangeCursorSelection(event => {
		updateCursorPosition(event)
	})
	editorInstance.onDidChangeModelContent(event => {
		emit('update:value', editorInstance.getValue())
	})
}
onMounted(() => init())
//#endregion

//#region 配置更新
watch(
	() => appStore.isDarkTheme,
	value => editor.setTheme(value ? 'vs-dark' : 'vs'),
)
watch(language, value => editor.setModelLanguage(editorInstance.getModel(), value))
watch(
	() => value,
	value => {
		if (value === editorInstance.getValue()) return
		editorInstance.setValue(value)
	},
)
//#endregion

//#region 光标位置
const cursorPosition = ref({ line: null, column: null, length: null })

function updateCursorPosition({ selection }: editor.ICursorSelectionChangedEvent) {
	const { lineNumber, column } = editorInstance.getPosition()
	const length = editorInstance.getModel().getValueInRange(selection).length
	cursorPosition.value = { line: lineNumber, column, length: length || null }
}
//#endregion

const languageOptions = computed(() => languages.map(item => ({ label: item, value: item })))
</script>

<template>
	<div class="editor">
		<div class="body" ref="body"></div>
		<div class="footer">
			<div class="footer_prefix">
				<div class="footer_item">{{ cursorPosition.line ? `${t('editor.line')} ${cursorPosition.line}` : null }}</div>
				<div class="footer_item">
					{{ cursorPosition.column ? `${t('editor.column')} ${cursorPosition.column}` : null }}
				</div>
				<div class="footer_item">
					{{ cursorPosition.length ? `（${cursorPosition.length} ${t('editor.selected')}）` : null }}
				</div>
			</div>
			<div class="footer_suffix">
				<NPopselect v-model:value="language" :options="languageOptions" size="small" placement="top-end">
					<NButton size="tiny" quaternary>{{ language }}</NButton>
				</NPopselect>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.editor {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.body {
	flex: 1;
	overflow: hidden;
}

.footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 4px;
	border-top: 1px solid var(--border-color);
	background-color: var(--card-color);
	font-size: var(--font-size-small);

	&_prefix,
	&_suffix {
		display: flex;
		align-items: center;
		gap: 5px;
	}
}
</style>
