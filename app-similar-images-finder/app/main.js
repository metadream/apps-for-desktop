/**
 * --------------------------------------------------------
 * Application Main Process
 * Author: Ai Chen
 * Copyright (c) 2020 Cloudseat.net
 * --------------------------------------------------------
 */
const electron = require('electron')
const path = require('path')

const mainPage = path.join(__dirname, 'gui/main.html')
const icon = path.join(__dirname, 'assets/icon.png')

const app = electron.app
const gotTheLock = app.requestSingleInstanceLock()

let mainWindow = null

if (!gotTheLock) { app.quit() } else {

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', function createWindow() {
        // Hide the menu of application
        electron.Menu.setApplicationMenu(null)

        // Create the browser window.
        mainWindow = new electron.BrowserWindow({
            width: 800,
            height: 500,
            icon: icon,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true
            }
        })

        // Open the DevTools.
        // mainWindow.webContents.openDevTools()

        // and load the main.html of the app.
        mainWindow.loadFile(mainPage)

        // Emitted when the window is closed.
        mainWindow.on('closed', function() {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null
        })
    })

    // Someone tried to run a second instance, we should focus our window.
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore()
            } else {
                mainWindow.focus()
            }
        }
    })

    // Quit when all windows are closed.
    app.on('window-all-closed', function() {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') app.quit()
    })

}
