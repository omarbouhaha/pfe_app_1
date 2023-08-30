const { app, BrowserWindow, Menu } = require("electron");
const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const isDev = true;
const { enable } = require("@electron/remote/main");
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} = require("electron-devtools-installer");
const AI_APP_STORAGE = "ai_app_storage";
require("@electron/remote/main").initialize();

let win;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), "public", "preload.js"),
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // maximize window
  win.maximize();

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  enable(win.webContents);
  // set menu visibility to false
  // win.setMenuBarVisibility(false);

  installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
  .then((name) => console.log(`Added Extension:  ${name}`))
  .catch((err) => console.log("An error occurred: ", err));
}

// create menu template
// const mainMenuTemplate = [
//   {
//     label: 'My Menu',
//     submenu: [
//       {
//         label: 'Do Something',
//         click: () => { console.log('Do Something') }
//       },
//       {
//         label: 'Do Something Else',
//         click: () => { console.log('Do Something Else') }
//       }
//     ]
//   },
//   {
//     label: 'Help',
//     submenu: [
//       {
//         label: 'About',
//         click: () => { console.log('About') }
//       }
//     ]
//   }
// ]

app.whenReady().then(() => {
  createWindow();
  // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Menu.setApplicationMenu(mainMenu);
  win.webContents.openDevTools();


});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  watcher.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ... after you've created your mainWindow ...

ipcMain.on("refresh-window", (event, arg) => {
  win.reload();
});


ipcMain.on('save-file', (event, filePath) => {
  console.log('Saving file...');
  // Get file name
  const fileName = path.basename(filePath);

  // The directory where the file will be saved
  const directoryPath = path.join(os.homedir(), `/${AI_APP_STORAGE}/`);
    
  // Make sure the directory exists, create it if it doesn't
  fs.mkdir(directoryPath, { recursive: true }, (err) => {
    if (err) {
      console.error('An error occurred: ', err);
      event.sender.send('save-file-reply', {
        success: false,
        message: `An error occurred: ${err.message}`
      });
      return;
    }
      
    // New path where the file will be saved
    const newFilePath = path.join(directoryPath, fileName);

    // Read file from filePath and write to newFilePath
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('An error occurred: ', err);
        event.sender.send('save-file-reply', {
          success: false,
          message: `An error occurred: ${err.message}`
        });
        return;
      }
    
      fs.writeFile(newFilePath, data, (err) => {
        if (err) {
          console.error('An error occurred: ', err);
          event.sender.send('save-file-reply', {
            success: false,
            message: `An error occurred: ${err.message}`
          });
        } else {
          console.log('File has been saved successfully.');
          event.sender.send('save-file-reply', {
            success: true,
            message: 'File has been saved successfully.'
          });
        }
      });
    });
  });
});


// Start watching the directory
const watcher = fs.watch(path.join(os.homedir(), `/${AI_APP_STORAGE}/`), (eventType, filename) => {
  win.webContents.send('directory-changed', { eventType, filename });
});


// Get file data
ipcMain.on('get-file-data', (event, filePath) => {
  console.log('Getting file data...');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log('There was an error reading the file!');
      return;
    }
    event.reply('file-data', data);
  });
  console.log('File data sent.');
});


// main.js
ipcMain.on('get-chart-data', (event, filePath) => {
  console.log('Getting chart data...');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log('There was an error reading the file!');
      return;
    }
    event.reply('chart-data', data);
  });
  console.log('Chart data sent.');
});
