const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow;
let nextProcess;
let logStream;

// ---------------------------------------------------------------------------
// Logging setup – resets the file on every launch
// ---------------------------------------------------------------------------
function setupLogger() {
  const userDataPath = app.getPath('userData');
  const logPath = path.join(userDataPath, 'tooltracker-pro-debug.log');

  // Ensure the directory exists
  fs.mkdirSync(userDataPath, { recursive: true });

  // Reset the log file on every launch (overwrite, not append)
  logStream = fs.createWriteStream(logPath, { flags: 'w' });

  function log(level, ...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(a =>
      typeof a === 'object' ? JSON.stringify(a) : String(a)
    ).join(' ');
    const line = `[${timestamp}] [${level}] ${message}\n`;
    logStream.write(line);
    // Also mirror to the original console so DevTools still work
    process.stdout.write(line);
  }

  // Expose a global logger
  global.logger = {
    info:  (...args) => log('INFO',  ...args),
    warn:  (...args) => log('WARN',  ...args),
    error: (...args) => log('ERROR', ...args),
  };

  global.logger.info('=== ToolTracker Pro started ===');
  global.logger.info(`Log file: ${logPath}`);
  global.logger.info(`Electron version: ${process.versions.electron}`);
  global.logger.info(`Node version: ${process.versions.node}`);
  global.logger.info(`Platform: ${process.platform} ${process.arch}`);

  // Catch unhandled errors in the main process
  process.on('uncaughtException', (err) => {
    global.logger.error('Uncaught Exception:', err.stack || err.message);
  });
  process.on('unhandledRejection', (reason) => {
    global.logger.error('Unhandled Rejection:', reason);
  });
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------
function createWindow() {
  global.logger.info('Creating main window…');

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

  // Wait for the Next.js server to be ready
  const checkServer = () => {
    http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        global.logger.info('Next.js server ready – loading URL');
        mainWindow.loadURL('http://localhost:3000');
      } else {
        global.logger.warn(`Server check returned status ${res.statusCode}, retrying…`);
        setTimeout(checkServer, 500);
      }
    }).on('error', (err) => {
      global.logger.warn(`Server not yet available (${err.message}), retrying…`);
      setTimeout(checkServer, 500);
    });
  };

  checkServer();

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    global.logger.error(`Page failed to load: [${errorCode}] ${errorDescription} – ${validatedURL}`);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    global.logger.error('Renderer process gone:', details);
  });

  mainWindow.on('closed', function () {
    global.logger.info('Main window closed');
    mainWindow = null;
  });
}

// ---------------------------------------------------------------------------
// Next.js server
// ---------------------------------------------------------------------------
function startNextServer() {
  const serverPath = path.join(process.resourcesPath, 'next-standalone', 'server.js');
  global.logger.info(`Starting Next.js server from: ${serverPath}`);

  const env = {
    ...process.env,
    PORT: 3000,
    HOSTNAME: 'localhost',
    ELECTRON_RUN_AS_NODE: '1',
    ELECTRON_NO_ASAR: '1'
  };

  nextProcess = spawn(process.execPath, [serverPath], {
    env,
    stdio: ['ignore', 'pipe', 'pipe']   // capture stdout & stderr
  });

  nextProcess.stdout.on('data', (data) => {
    global.logger.info('[next]', data.toString().trim());
  });

  nextProcess.stderr.on('data', (data) => {
    global.logger.error('[next-err]', data.toString().trim());
  });

  nextProcess.on('exit', (code, signal) => {
    global.logger.warn(`Next.js process exited – code: ${code}, signal: ${signal}`);
  });

  nextProcess.on('error', (err) => {
    global.logger.error('Failed to start Next.js process:', err.message);
  });
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------
app.on('ready', () => {
  setupLogger();
  global.logger.info('Electron app ready');
  startNextServer();
  createWindow();
});

app.on('window-all-closed', function () {
  global.logger.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

let isQuitting = false;

app.on('before-quit', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    global.logger.info('Intercepted quit to perform auto-backup...');
    
    let backupDone = false;
    const resumeQuit = () => {
      if (backupDone) return;
      backupDone = true;
      isQuitting = true;
      app.quit();
    };

    // Timeout de 4 segundos máximo para no bloquear el cierre
    setTimeout(resumeQuit, 4000);

    http.get('http://localhost:3000/api/auto-backup', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        global.logger.info(`Auto-backup completed: ${data}`);
        resumeQuit();
      });
    }).on('error', (err) => {
      global.logger.error(`Auto-backup failed: ${err.message}`);
      resumeQuit();
    });
  }
});

app.on('will-quit', () => {
  global.logger.info('=== ToolTracker Pro shutting down ===');
  if (nextProcess) {
    nextProcess.kill();
  }
  if (logStream) {
    logStream.end();
  }
});
