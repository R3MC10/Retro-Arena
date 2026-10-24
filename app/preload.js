// Gives the game page a small, safe bridge to LAN features.
const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('RA_LAN', {
  setBeacon: data => ipcRenderer.send('lan-beacon-set', data),
  onBeacon: cb => ipcRenderer.on('lan-beacon', (_e, m) => cb(m)),
  hubStart: () => ipcRenderer.invoke('lan-hub-start'),
  hubStop: () => ipcRenderer.invoke('lan-hub-stop')
});
