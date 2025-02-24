import { contextBridge, ipcRenderer } from 'electron'
import { Main } from './interface.ts'
import { ElectronAPI } from '@/interface.ts'

contextBridge.exposeInMainWorld('electronAPI', {
	updateTheme: (...args) => ipcRenderer.send(Main.UpdateTheme, ...args),
	getTheme: (...args) => ipcRenderer.sendSync(Main.GetTheme, ...args),
	getLocale: (...args) => ipcRenderer.sendSync(Main.GetLocale, ...args),
	getAccentColor: (...args) => ipcRenderer.sendSync(Main.GetAccentColor, ...args),
	onAccentColorChanged: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.OnAccentColorChanged, (_event, ...args) => callback(...args)),
	mqttConnect: (...args) => ipcRenderer.invoke(Main.MqttConnect, ...args),
	mqttDisconnect: (...args) => ipcRenderer.invoke(Main.MqttDisconnect, ...args),
	mqttConnected: (...args) => ipcRenderer.sendSync(Main.MqttConnected, ...args),
	mqttConnectedBatch: (...args) => ipcRenderer.sendSync(Main.MqttConnectedBatch, ...args),
	mqttSubscribe: (...args) => ipcRenderer.invoke(Main.MqttSubscribe, ...args),
	mqttUnsubscribe: (...args) => ipcRenderer.invoke(Main.MqttUnsubscribe, ...args),
	mqttPublish: (...args) => ipcRenderer.invoke(Main.MqttPublish, ...args),
	onMqttConnect: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.OnMqttConnect, (_event, ...args) => callback(...args)),
	onMqttDisconnect: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.OnMqttDisconnect, (_event, ...args) => callback(...args)),
	onMqttError: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.OnMqttError, (_event, ...args) => callback(...args)),
	onMqttMessage: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.OnMqttMessage, (_event, ...args) => callback(...args)),
	openFileDialog: (...args) => ipcRenderer.invoke(Main.OpenFileDialog, ...args),
} as ElectronAPI)
