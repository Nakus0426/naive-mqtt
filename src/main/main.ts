import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { createWindow } from './create-window.ts'
import { store } from './store.ts'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

if (require('electron-squirrel-startup')) app.quit()

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})

function createMainWindow() {
	const mainWindow = createWindow()
	store.set('theme', nativeTheme.themeSource)
	ipcMain.on('update-theme', (event, theme) => {
		nativeTheme.themeSource = theme
		mainWindow.setTitleBarOverlay({
			color: 'rgba(0, 0, 0, 0)',
			symbolColor: nativeTheme.shouldUseDarkColors ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
		})
		store.set('theme', theme)
	})
}
