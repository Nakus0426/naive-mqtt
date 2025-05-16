import {
	type BrowserWindow,
	type NativeTheme,
	type OpenDialogOptions,
	nativeTheme,
	app,
	dialog,
	systemPreferences,
} from 'electron'
import { store } from '../store.ts'
import { type IMainService, MainServiceEventEnum } from './interface.ts'

export class MainService implements IMainService {
	mainWindow: BrowserWindow
	private eventHandlers = new Map<MainServiceEventEnum, Array<Function>>()

	constructor() {
		systemPreferences.on('accent-color-changed', (_event, color) => {
			this.emit(MainServiceEventEnum.AccentColorChanged, color)
		})
	}
	updateTheme(theme: NativeTheme['themeSource']) {
		nativeTheme.themeSource = theme
		this.mainWindow.setTitleBarOverlay({
			color: 'rgba(0, 0, 0, 0)',
			symbolColor: nativeTheme.shouldUseDarkColors ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
		})
		store.set('theme', theme)
	}
	getTheme() {
		return nativeTheme.themeSource
	}
	getLocale() {
		return app.getLocale()
	}
	async openFileDialog(options: OpenDialogOptions) {
		const { filePaths } = await dialog.showOpenDialog(this.mainWindow, options)
		return filePaths
	}
	getAccentColor() {
		return systemPreferences.getAccentColor()
	}
	on(event: MainServiceEventEnum, handler: Function) {
		if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, [])
		else this.eventHandlers.get(event)?.push(handler)
	}
	off(event: MainServiceEventEnum, handler: Function) {
		const handlers = this.eventHandlers.get(event)
		if (!handlers) return
		const index = handlers.indexOf(handler)
		if (index !== -1) handlers.splice(index, 1)
	}
	private emit(event: MainServiceEventEnum, ...args: any[]) {
		const handlers = this.eventHandlers.get(event)
		if (!handlers) return
		handlers.forEach(handler => handler(...args))
	}
}
