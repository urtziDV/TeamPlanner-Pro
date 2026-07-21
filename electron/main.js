const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let nextProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'logo.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenu(null);

  // Wait for the server to be ready
  const checkServer = () => {
    http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        mainWindow.loadURL('http://localhost:3000');
      } else {
        setTimeout(checkServer, 500);
      }
    }).on('error', () => {
      setTimeout(checkServer, 500);
    });
  };

  checkServer();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startNextServer() {
  // next-standalone is in resources/, not inside the asar bundle
  const serverPath = path.join(process.resourcesPath, 'next-standalone', 'server.js');
  
  // Set ELECTRON_NO_ASAR to 1 to bypass electron's fs patches in Next.js environment
  const env = {
    ...process.env,
    PORT: 3000,
    HOSTNAME: 'localhost',
    ELECTRON_RUN_AS_NODE: '1',
    ELECTRON_NO_ASAR: '1'
  };

  nextProcess = spawn(process.execPath, [serverPath], {
    env,
    stdio: 'inherit'
  });
}

app.on('ready', () => {
  startNextServer();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});
