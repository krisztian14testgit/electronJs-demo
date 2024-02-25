"use strict";
 
/** Loads the content of the saved-array.txt into the arrayResult when window is rendered.*/
const arrayResult = document.getElementById('arrayResult');
window.addEventListener('load', (async() => {
	arrayResult.innerText = await electronAPI.getSavedArray('sent data, renderer');
	
	// get data form main-process by callback(event,value) func
	window.electronAPI.onMsgFromMain((event, value) => {
		console.log('got message from Main: ', value);
		
		// replay back to main-process
		const newValue = 'thanks data';
		// event.sender.send('from-main', newValue); // not working to replay back
		//	mainWindow.webContents.send('from-main', newValue);
	});
}));


const insertButton = document.getElementById('insertButton');
const saveArrayButton = document.getElementById('saveArray');
let isActivedSaveButton = false;

// inserting input value into array
insertButton.addEventListener('click', () => {
	const input = document.getElementsByTagName('input')[0]; // get first occurrence
	
	if (input && input.value.length > 0) {
		arrayResult.innerText += `${input.value}, `;
		input.value = '';
	}
	
	// activate array save button
	if (!isActivedSaveButton && arrayResult.innerText.length > 0) {
		isActivedSaveButton = true;
		saveArrayButton.disabled  = false;
	}
});

// Saving array elements
saveArrayButton.addEventListener('click', () => {
	if (arrayResult.innerText.length > 0) {
		// remove last comma
		let items = arrayResult.innerText;
		items = items.substring(0, items.length - 1);
		// saveArray come form the preload.js => ipcRenderer.send('chanelName', value)
		window.electronAPI.saveArray(items);
	}
});

// Empty the array.
const clearArrayButton = document.getElementById('clearArray');
clearArrayButton.addEventListener('click', () => {
	arrayResult.innerText = '';
});

/* -- Get variable from the 'main' process -- */
const globalVar_p = document.getElementById('globalVar-p');
globalVar_p.innerText = `This node version: ${electronAPI.getNodeV()}, testVar= ${electronAPI.test}`;

const pingButton = document.getElementById('pingButton');
pingButton.addEventListener('click', (async() => {
	// emits the event form 'renderer' process to 'main' process via sendMsg
	const response = await window.electronAPI.sendMsg('ping msg');
	globalVar_p.innerText = response;
}));
