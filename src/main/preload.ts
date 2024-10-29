import { contextBridge, ipcRenderer } from 'electron'
import { Main } from './interface'
import { ElectronAPI } from '@/interface'

contextBridge.exposeInMainWorld('electronAPI', {
	updateTheme: (...args) => ipcRenderer.send(Main.UpdateTheme, ...args),
	getTheme: (...args) => ipcRenderer.sendSync(Main.GetTheme, ...args),
	getLocale: (...args) => ipcRenderer.sendSync(Main.GetLocale, ...args),
	createClient: (...args) => ipcRenderer.invoke(Main.CreateClient, ...args),
	onConnect: (callback: (...args: any[]) => void) =>
		ipcRenderer.on(Main.OnConnect, (_event, ...args) => callback(...args)),
	openFileDialog: (...args) => ipcRenderer.invoke(Main.OpenFileDialog, ...args),
} as ElectronAPI)
