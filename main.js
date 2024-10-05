const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater'); // Importing autoUpdater
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
require('dotenv').config();

const firebaseConfig = {
    apiKey: "AIzaSyDyo_7FRkKgNDPGfmV38hMBTvNM-bCZcR0",
    authDomain: "constellate-13642408.firebaseapp.com",
    projectId: "constellate-13642408",
    storageBucket: "constellate-13642408.appspot.com",
    messagingSenderId: "1067431241975",
    appId: "1:1067431241975:web:ed7781dca93ca960d8cbf2"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

let startTime, endTime;

// Only use electron-reload in a development environment
if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            sandbox: false,
            webSecurity: false,
        },
        fullscreen: true,
        frame: false,
        resizable: false,
        movable: false,
    });

    mainWindow.loadFile('login.html');
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            var audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer) {
                var playPromise = audioPlayer.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        console.log('Autoplay started');
                    }).catch(error => {
                        console.error('Autoplay prevented:', error);
                    });
                }
            }
        `);
    });
}

app.whenReady().then(() => {
    startTime = new Date();
    createWindow();

    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();
});

// Auto-updater events
autoUpdater.on('update-available', () => {
    console.log('Update available. Downloading...');
});

autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded. Installing...');
    autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', async () => {
    endTime = new Date();
    const duration = (endTime - startTime) / 1000; // Duration in seconds
    console.log(`Time spent on app: ${duration} seconds`);

    try {
        await addDoc(collection(db, "sessionTimes"), {
            duration: duration, // Time in seconds
            timestamp: serverTimestamp()
        });
        console.log("Session time recorded in Firestore.");
    } catch (error) {
        console.error("Error recording session time: ", error);
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
