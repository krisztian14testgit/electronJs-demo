"use strict;"
/**
* ElectronJs DEMO - tutiroal by https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app

 * ElectronJs allow using commonJs importing: require('bundle')
 * main process: 	which controls your application's event lifecycle,
					using nodejs features
 * BrowserWindow: 	which creates and manages app windows.
 * renderer: 		displaying html tags,
					using window, document prototype, setTimeout, setInterval
					running javascript files
*/
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const startedPage = 'index.html';

/** IPC - Inter Process Communication: https://www.electronjs.org/docs/latest/tutorial/ipc
  * function pair: ipcMian - ipcRenderer
  
  * ipc - Renderer to main,
  * one-way direction, return nothing
  * mian process is listener
  * saving array element into the saved-array.txt when it is triggered.
*/
const ipcSubscribeOnSavingArray = () => {
	// one-way direction communication, 
	// params: channel name, callbackFunc(event, value: any)
	ipcMain.on('save-array', (event, array) => {
		// console.log('event=', event);
		console.log('array to be saved=', array);
		const strArray = `[${array}]`;
		fs.writeFile('saved-array.txt', strArray, 'utf8', (err, data) => {
			if (err) { 
				console.log(err);
				return;
			}
			console.log('Saving is successful!');
		});
	});
};

/** ipc - Renderer to main
  * two-way direction, return the result
  * renderer callick channel and waiting for result (Promise request),
  * using: reading file to get content, promise request
*/
function ipcGetSavedArray() { 
	ipcMain.handle('load-array', () => {
		try {
			let arrayElements = fs.readFileSync('saved-array.txt', 'utf8');
			// removing brackets: []
			arrayElements = arrayElements.substring(1);
			return arrayElements.substring(0, arrayElements.length - 1);
		} catch (err) {
			console.log(err);
			return Promise.resolve('file not found!');
		}
	});
}

/** How to creata default eletron window */
const createWindow = () => {	
	const mainWindow = new BrowserWindow({
	width: 800,
	height: 600,
		webPreferences: {
		  sandbox: true, // <-- security reason, code not modify the OS file system		
		  preload: path.join(__dirname, 'src/main-process/preload.js'),
		},
	});
  
	// subscribe on 'ping' channel via the ipc to get message from 'rederer' process
	ipcMain.handle('ping', (getMsg) => 'main process got: ' + getMsg);
  
	mainWindow.loadFile(startedPage);
  
	/** Open/close devTool by f12 button */
	let isOpenDevTool = false;
	let devToolMethod = 'openDevTools';
	mainWindow.webContents.on("before-input-event", (event, input) => {
		if (input.type === 'keyDown' && input.key === 'F12') {
			devToolMethod = !isOpenDevTool ? 'openDevTools' : 'closeDevTools';
			mainWindow.webContents[devToolMethod]();
			console.log(devToolMethod);
			isOpenDevTool = !isOpenDevTool;
		}
	});
};

/** the app is ready creating an window*/
app.whenReady().then(() => {
	/** ipc protocol here*/
	ipcSubscribeOnSavingArray();
	ipcGetSavedArray();
	
	/** creating window */
	createWindow();
  
	// for Mac: mac app running in background without any window is open.
	//  Activating the app when no windows are available should open a new one.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

// Quitting the app diff in Mac OS
/** There are three supported platform:
	* windows 	=> win32
	* Linux 	=> linux
	* macOs 	=> darwin
*/
app.on('window-all-closed', () => {
	// quit the app in linux, win platforms
	console.log('platform:', process.platform);
	// if it is not mac
	if (process.platform !== 'dardwin') { app.quit(); }
});
