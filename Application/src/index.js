const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const https = require('https')

const express = require('express');
const appS = express();
const server = appS.listen(7777);
var io = require('socket.io')(server);

const discord = require('discord-rich-presence')('821703708244312065');

var $ipsConnected = [];

var lastTitle = 'unset';
var lastUrl = 'unset';
var socketStatus = 1;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  mainWindow.setResizable(false)

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  ipcMain.on('close-app', (event, arg) => {
    app.exit(0);
  })
  ipcMain.on('minimize-app', (event, arg) => {
    mainWindow.minimize();
  })

  ipcMain.on('disable-socket', (event, arg) => {
    socketStatus = 0;

    statuslog('<b class="badus">Server has been disabled</b>')
  })

  ipcMain.on('enable-socket', (event, arg) => {
    socketStatus = 1;

    statuslog('<b class="goodus">Server has been enabled</b>')
  })

  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.setSkipTaskbar(true);
    tray = createTray();
  });

  mainWindow.on('restore', function (event) {
    mainWindow.show();
    mainWindow.setSkipTaskbar(false);
    tray.destroy();
  });

  function createTray() {
    let appIcon = new Tray(path.join(__dirname, "assets/img/ico.ico"));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Browser Discord Status',
            enabled: false
        },
        {
            label: 'Main Page', click: function () {
                mainWindow.show();
            }
        },
        {
            label: 'Quit App', click: function () {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
  
    appIcon.on('click', function (event) {
        mainWindow.show();
    });
    appIcon.setToolTip('Browser Discord Status');
    appIcon.setContextMenu(contextMenu);
    return appIcon;
  }

  function checkisoutdated(){
    const req = https.request({hostname: 'api.4uss.cyou', port: 443, path: `/extension/version.json`,method: 'GET'}, res => {
  
      res.on('data', d => {
        var data = JSON.parse(d)

          if(data.browserdiscordstatus != `${app.getVersion()}`){
            mainWindow.webContents.send('outdated', 'New update is available to download');
          }
      })
    })
    req.end()
  }
  setInterval(() => {
    checkisoutdated()
  }, 60 * 1000);

  function statuslog(message){
    mainWindow.webContents.send('statusDownload', message);
  }

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

discord.updatePresence({
  details: 'Przeglądanie internetu',
  startTimestamp: Date.now(),
  largeImageKey: 'chrome',
  largeImageText: 'google.com',
  smallImageKey: 'download',
  smallImageText: 'www.4uss.cyou/chrome-discord',
  instance: true,
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
io.on('connection', function (socket) {
  var $ipAddress = socket.handshake.headers['x-forwarded-for'];

  if (!$ipsConnected.hasOwnProperty($ipAddress)) {
      $ipsConnected[$ipAddress] = 1;
  }
  /* Disconnect socket */
  socket.on('disconnect', function() {
      if ($ipsConnected.hasOwnProperty($ipAddress)) {
          delete $ipsConnected[$ipAddress];
      }
  });
  /* Przyjmowanie*/
  socket.on('ussDiscordActive', (data) => {

    chromeStatusRPC(data.url, data.title)
  
  });

  socket.on('ussDiscordUpdate', (data) => {

    chromeStatusRPC(data.url, data.title)
  
  });

  socket.on('requestedDataChrome', (data) => {

    if(data.title != lastTitle || data.url != lastUrl) return chromeStatusRPC(data.url, data.title);

  });

  setInterval(() => {
    socket.emit('currentData');

  }, 30 * 1000);

});

function chromeStatusRPC(url, title){

  if(socketStatus === 0) return;

  const chars = url.split('/');
  var ussModificated = title.substring(0, 60);
  var ussModificatedU = url.substring(0, 128);

  lastTitle = ussModificated;
  lastUrl = ussModificatedU;

  const req = https.request({hostname: 'api.4uss.cyou', port: 443, path: `/usslist.php?url=${chars[2]}`,method: 'GET'}, res => {
  
    res.on('data', d => {

      var data = JSON.parse(d);

      if(res.statusCode === 200){
        customChromeStatusRPC(ussModificated, data[0].name, data[0].image)
      }else{
        discord.updatePresence({
          details: ussModificated,
          startTimestamp: Date.now(),
          largeImageKey: 'chrome',
          largeImageText: ussModificatedU,
          smallImageKey: 'download',
          smallImageText: 'www.4uss.cyou/chrome-discord',
          instance: true,
        })
      }

    })
  })
  req.on('error', error => {
    console.log(error)
  })
  req.end()
}
function customChromeStatusRPC(title, name, image){
  discord.updatePresence({
    details: title,
    startTimestamp: Date.now(),
    largeImageKey: image,
    largeImageText: name,
    smallImageKey: 'download',
    smallImageText: 'www.4uss.cyou/chrome-discord',
    instance: true,
  });
}