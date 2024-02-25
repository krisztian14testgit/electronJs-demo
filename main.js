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
					
 * for Angular:   Helping side: https://buddy.works/tutorials/building-a-desktop-app-with-electron-and-angular
*/
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require("url");

// the path of the index.html
const startedPage = 'index.html';

// url attaching of index.html
const indexUrl = url.format(path.join(__dirname, startedPage), {
    protocol: 'file',
    slashes: true,
});

/** IPC - Inter Process Communication: https://www.electronjs.org/docs/latest/tutorial/ipc
  * function pair: ipcMian - ipcRenderer
  
  * ipc - Renderer to main,
  * one-way direction, return nothing
  * mian process is listener(ipcMian.on()), renderer send data to main.
  
  * @preloadFunc: saveArray()
  * @using: saving array element into the saved-array.txt when it is triggered.
  * @return never
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
  *
  *	@preloadFunc: getSavedArray()
  * @using: reading file to get content, promise request
  * @return Promise.resolve(fileContent)
*/
function ipcGetSavedArray() { 
	ipcMain.handle('load-array', (event, dataFromRenderer) => {
		try {
			console.log('load-array channel: got data from renderer =', dataFromRenderer);
			let arrayElements = fs.readFileSync('saved-array.txt', 'utf8');
			// removing brackets: []
			arrayElements = arrayElements.substring(1);
			return arrayElements.substring(0, arrayElements.length - 1) + ',';
		} catch (err) {
			console.log(err);
			return Promise.resolve('file not found!');
		}
	});
}

/** IPC - Main to renderer
  * two-way direction
  * Sending message/data from the main to renderer.
  * Important: which renderer(can more) is receiving data.
  *
  * @preloadFunc: onMsgFromMain(callBack)
  * @using: It triggers when F9 button is clocked on
  * @return never
*/
function ipcSendDataToRenderer(mainWindowRef) {
	// send message to renderer
	const value = 'sth from main';
	mainWindowRef.webContents.send('from-main', value);
	
	// got message from renderer, same channel
	ipcMain.on('from-main', (_event, value) => {
		console.log('ipc from-main channgel: = ', value);
	});
	
}

/** How to creata default electron window */
const createWindow = () => {	
	const mainWindow = new BrowserWindow({
	width: 800,
	height: 600,
		webPreferences: {
		  sandbox: true, // <-- security reason, code not modify the OS file system    
		  preload: path.join(__dirname, 'src/main-process/preload.js'),
		},
	});
  
	mainWindow.loadFile(startedPage);
	// mainWindow.loadURL(indexUrl);
	
  
	/** Open/close devTool by f12 button */
	let isOpenDevTool = true;
	let devToolMethod = 'openDevTools';
	// after window creation, open DevTool window
	mainWindow.webContents[devToolMethod]();
	// keyboad: f12
	mainWindow.webContents.on("before-input-event", (event, input) => {
		if (input.type === 'keyDown' && input.key === 'F12') {
			devToolMethod = !isOpenDevTool ? 'openDevTools' : 'closeDevTools';
			mainWindow.webContents[devToolMethod]();
			console.log(devToolMethod);
			isOpenDevTool = !isOpenDevTool;
		}
		
		if (input.type === 'keyDown' && input.key === 'F9') {
			console.log('F9 pushed');
			ipcSendDataToRenderer(mainWindow);
		}
	});
};

/** the app is ready creating an window*/
app.whenReady().then(() => {
	/** ipc protocol here*/
	// subscribe on 'ping' channel via the ipc to get message from 'rederer' process
	ipcMain.handle('ping', (getMsg) => 'main process got: ' + JSON.stringify(getMsg));
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
	// if it is not Mac, quitting from the app
	if (process.platform !== 'dardwin') { app.quit(); }
});
