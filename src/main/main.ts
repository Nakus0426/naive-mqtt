import { app, BrowserWindow, ipcMain, nativeTheme, dialog } from 'electron'
import { createWindow } from './create-window'
import { store } from './store'
import { createRequire } from 'node:module'
import { Main } from './interface'
import { Mqtt } from './mqtt'

const require = createRequire(import.meta.url)

if (require('electron-squirrel-startup')) app.quit()

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})

let mainWindow: BrowserWindow

function createMainWindow() {
	mainWindow = createWindow()
	nativeTheme.themeSource = store.get('theme') || 'system'
	store.set('theme', nativeTheme.themeSource)
	new Mqtt(mainWindow)
}

ipcMain.on(Main.UpdateTheme, (_event, theme) => {
	nativeTheme.themeSource = theme
	mainWindow.setTitleBarOverlay({
		color: 'rgba(0, 0, 0, 0)',
		symbolColor: nativeTheme.shouldUseDarkColors ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
	})
	store.set('theme', theme)
})

ipcMain.on(Main.GetTheme, event => (event.returnValue = nativeTheme.themeSource))

ipcMain.on(Main.GetLocale, event => (event.returnValue = app.getLocale()))

ipcMain.handle(Main.OpenFileDialog, async (event, options) => {
	const { filePaths } = await dialog.showOpenDialog(mainWindow, options)
	return filePaths
})
