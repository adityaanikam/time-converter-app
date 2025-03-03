const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let pythonProcess;

// Function to start the Flask server
function startPythonServer() {
    // Determine the path to the Python script and interpreter
    const pythonScriptPath = path.join(__dirname, 'app.py');
    const pythonExecutable = process.platform === 'win32'
        ? path.join(process.env.VIRTUAL_ENV || '', 'Scripts', 'python.exe')
        : 'python3'; // Adjust for other OSes as needed

    // Check if the Python script exists
    if (!fs.existsSync(pythonScriptPath)) {
        dialog.showErrorBox(
            'Missing Server File',
            `app.py is missing. Please ensure it exists in the application directory.`
        );
        app.quit();
        return;
    }

    // Check if the Python executable exists (falls back to system Python if virtual env not found)
    if (!fs.existsSync(pythonExecutable)) {
        dialog.showErrorBox(
            'Missing Python',
            `Python executable not found at ${pythonExecutable}. Please install Python or set up a virtual environment.`
        );
        app.quit();
        return;
    }

    // Spawn the Python process with the script
    pythonProcess = spawn(pythonExecutable, [pythonScriptPath], {
        stdio: 'pipe', // Use 'pipe' to capture output for debugging if needed
        cwd: __dirname // Set working directory to the app's root
    });

    // Log server output for debugging
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Server: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Server Error: ${data}`);
    });

    // Handle server errors
    pythonProcess.on('error', (err) => {
        dialog.showErrorBox(
            'Server Error',
            `Failed to start server: ${err.message}\n\nEnsure all Python dependencies are installed (e.g., run 'pip install -r requirements.txt').`
        );
        app.quit();
    });

    // Handle server exit
    pythonProcess.on('exit', (code) => {
        console.log(`Python server exited with code ${code}`);
        pythonProcess = null;
        if (code !== 0 && mainWindow) {
            dialog.showErrorBox(
                'Server Crash',
                'The Python server has crashed. The application will now close.'
            );
            app.quit();
        }
    });

    // Wait a moment to ensure the server is up
    return new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Caution: Consider enabling contextIsolation for security
        },
        icon: path.join(__dirname, 'icon.png'),
        title: 'Aditya - Bulk Email & Video Recorder'
    });

    // Attempt to load the Flask app after server startup
    startPythonServer().then(() => {
        mainWindow.loadURL('http://localhost:5000');

        // Handle loading errors (e.g., if server doesn't start)
        mainWindow.webContents.on('did-fail-load', () => {
            dialog.showErrorBox(
                'Connection Error',
                'Failed to connect to the server at http://localhost:5000. Ensure the Python server is running and dependencies are installed.'
            );
            mainWindow.loadFile('index.html'); // Fallback to local HTML if server fails
        });
    }).catch(err => {
        console.error('Failed to start server:', err);
        app.quit();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('quit', () => {
    // Clean up by killing the Python process
    if (pythonProcess) {
        pythonProcess.kill('SIGTERM');
        pythonProcess = null;
    }
});