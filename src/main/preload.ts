import { contextBridge, ipcRenderer } from 'electron'
import { Main } from './interface.ts'
import { ElectronAPI } from '@/interface.js'

contextBridge.exposeInMainWorld('electronAPI', {
	updateTheme: (...args) => ipcRenderer.send(Main.UpdateTheme, ...args),
	getTheme: (...args) => ipcRenderer.sendSync(Main.GetTheme, ...args),
	getLocale: (...args) => ipcRenderer.sendSync(Main.GetLocale, ...args),
} as ElectronAPI)
