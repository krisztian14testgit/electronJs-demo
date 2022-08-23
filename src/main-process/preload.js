"use strict";

/** 
 * contextBrige: module can be used to safely expose APIs from your preload script's isolated context 
 * 			to the context the website is running in. 
 *			The API will also be accessible from the website on window.myAPI just like it was before.
 * link: https://www.electronjs.org/docs/latest/tutorial/context-isolation
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
