import { contextBridge, ipcRenderer } from 'electron'
import { Main } from './interface.ts'
import { ElectronAPI } from '@/interface.ts'

contextBridge.exposeInMainWorld('electronAPI', {
	updateTheme: (...args) => ipcRenderer.send(Main.UpdateTheme, ...args),
	getTheme: (...args) => ipcRenderer.sendSync(Main.GetTheme, ...args),
	getLocale: (...args) => ipcRenderer.sendSync(Main.GetLocale, ...args),
	getAccentColor: (...args) => ipcRenderer.sendSync(Main.GetAccentColor, ...args),
	mqttConnect: (...args) => ipcRenderer.invoke(Main.MqttConnect, ...args),
	mqttDisconnect: (...args) => ipcRenderer.invoke(Main.MqttDisconnect, ...args),
	mqttConnected: (...args) => ipcRenderer.sendSync(Main.MqttConnected, ...args),
	mqttConnectedBatch: (...args) => ipcRenderer.sendSync(Main.MqttConnectedBatch, ...args),
	mqttSubscribe: (...args) => ipcRenderer.invoke(Main.MqttSubscribe, ...args),
	mqttUnsubscribe: (...args) => ipcRenderer.invoke(Main.MqttUnsubscribe, ...args),
	mqttPublish: (...args) => ipcRenderer.invoke(Main.MqttPublish, ...args),
	mqttOnConnect: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.MqttOnConnect, (_event, ...args) => callback(...args)),
	mqttOnDisconnect: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.MqttOnDisconnect, (_event, ...args) => callback(...args)),
	mqttOnError: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.MqttOnError, (_event, ...args) => callback(...args)),
	openFileDialog: (...args) => ipcRenderer.invoke(Main.OpenFileDialog, ...args),
} as ElectronAPI)
