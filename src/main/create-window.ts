import { BrowserWindow, nativeTheme } from 'electron'
import { nanoid } from 'nanoid'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

type Options = {
	id?: string
	width?: number
	height?: number
	minWidth?: number
	minHeight?: number
	resizable?: boolean
	hash?: string
	showImmediately?: boolean
	parent?: BrowserWindow
}

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

const windowPool = new Map<string, BrowserWindow>()

export function createWindow(options?: Options) {
	const {
		id = nanoid(),
		width = 1000,
		height = 800,
		minWidth = 800,
		minHeight = 600,
		resizable = true,
		hash,
		showImmediately = true,
		parent,
	} = options || {}

	if (windowPool.has(id)) {
		const browserWindow = windowPool.get(id)
		if (showImmediately) browserWindow.show()
		return browserWindow
	}

	const browserWindow = new BrowserWindow({
		tabbingIdentifier: id,
		width,
		height,
		minWidth,
		minHeight,
		resizable,
		show: false,
		parent,
		modal: !!parent,
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: 'rgba(0, 0, 0, 0)',
			symbolColor: nativeTheme.shouldUseDarkColors ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
			height: 30,
		},
		backgroundMaterial: 'mica',
		webPreferences: {
			preload: join(__dirname, 'preload.mjs'),
			experimentalFeatures: true,
			scrollBounce: true,
			backgroundThrottling: false,
			spellcheck: false,
		},
	})

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) browserWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}${hash || ''}`)
	else browserWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), { hash })

	if (showImmediately) browserWindow.once('ready-to-show', () => browserWindow.show())

	return browserWindow
}
