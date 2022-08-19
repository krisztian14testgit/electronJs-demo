"use strict";

/** 
 * contextBrige: 
*/
const { contextBridge, ipcRenderer } = require('electron');
// You CANNOT IMPORT nodejs library here, as you CANNOT USE IT under electron!!!
const TEST = 'test2';

// we can also expose/share variables, not just functions
contextBridge.exposeInMainWorld('electronAPI', {
  getNodeV: () => process.versions.node,
  test: TEST, // <-- variable
  // 'event' message stream to main process, safety good code
  sendMsg: () => ipcRenderer.invoke('ping'), // promise request => async - await
  saveArray: (array) => ipcRenderer.send('save-array', array),
  getSavedArray: () => ipcRenderer.invoke('load-array'), // promise request => async - await, to get array content
});
