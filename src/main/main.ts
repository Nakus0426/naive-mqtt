import { app, BrowserWindow, nativeTheme } from 'electron'
import started from 'electron-squirrel-startup'
import { createWindow } from './create-window.ts'
import { store } from './store.ts'
import { MqttService } from './services/mqtt-service.ts'
import { MainService } from './services/main-service.ts'
import { createServer } from 'electron-bridge-ipc/electron-main'
import { DisposableStore, ProxyChannel } from 'electron-bridge-ipc'
import { ChannelNameEnum } from './services/interface.ts'

if (started) app.quit()

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})

let mainWindow: BrowserWindow

function createMainWindow() {
	const server = createServer()
	const disposables = new DisposableStore()
	const mainService = new MainService()
	server.registerChannel(ChannelNameEnum.Mqtt, ProxyChannel.fromService(new MqttService(), disposables))
	server.registerChannel(ChannelNameEnum.Main, ProxyChannel.fromService(mainService, disposables))
	mainWindow = createWindow()
	mainService.mainWindow = mainWindow
	nativeTheme.themeSource = store.get('theme') || 'system'
	store.set('theme', nativeTheme.themeSource)
}
