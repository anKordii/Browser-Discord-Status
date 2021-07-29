const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const https = require('https')
const express = require('express');
const appS = express();
const server = appS.listen(7777);
var io = require('socket.io')(server);
const discord = require('discord-rich-presence')('821703708244312065');

var lastTitle = 'unset';
var lastUrl = 'unset';
var socketStatus = 1;

if (require('electron-squirrel-startup')) {
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

    statuslog('<b class="badus">Status has been paused</b>')
  })

  ipcMain.on('enable-socket', (event, arg) => {
    socketStatus = 1;

    statuslog('<b class="goodus">Status has been unpaused</b>')
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
            label: 'Discord Server',
            enabled: false
        },
        {
            label: 'Home', click: function () {
                mainWindow.show();
            }
        },
        {
            label: 'Close', click: function () {
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
    const req = https.request({hostname: 'api.beyondlabs.pl', port: 443, path: `/discord.json`,method: 'GET'}, res => {
  
      res.on('data', d => {
        var data = JSON.parse(d)
          if(data.browserdiscordstatus != `${app.getVersion()}`){
            mainWindow.webContents.send('outdated', 'New update is available to download from GitHub');
          }
      })
    })
    req.end()
  }
  setInterval(() => {
    checkisoutdated()
  }, 60 * 1000);
  checkisoutdated();

  function statuslog(message){mainWindow.webContents.send('statusDownload', message);}
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

discord.updatePresence({
  details: 'Browser Discord Status',
  state: 'Idle',
  startTimestamp: Date.now(),
  largeImageKey: 'global',
  largeImageText: 'Idle',
  instance: true,
  buttons: [
    { label: 'Download', url: 'https://chrome.google.com/webstore/detail/browser-discord-status/aklnceehjhihdljbcajhdiehaphlafjl'}
  ]
})

io.on('connection', function (socket) {
  /* Przyjmowanie*/
  socket.on('ussDiscordActive', (data) => {

    if(data.title === data.url){
      socket.emit('currentData');
    }else{
      chromeStatusRPC(data.url, data.title, data.notSuppoerted)
    }
  
  });

  socket.on('ussDiscordUpdate', (data) => {

    if(data.title === data.url){
      socket.emit('currentData');
    }else{
      chromeStatusRPC(data.url, data.title, data.notSuppoerted)
    }
  
  });

  socket.on('requestedDataChrome', (data) => {

    if(data.title != lastTitle || data.url != lastUrl) return chromeStatusRPC(data.url, data.title, data.notSuppoerted);

  });

  setInterval(() => {socket.emit('currentData');}, 5 * 1000);

});

function chromeStatusRPC(url, title, notSuppoerted){

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
        if(data[0].special === 'yes'){
          specialChromeStatusRPC(ussModificated, data[0].name, data[0].image, data[0].special_button, url)
        }else{
          customChromeStatusRPC(ussModificated, data[0].name, data[0].image)
        }
      }else{
        if(notSuppoerted === 'true') return;
        discord.updatePresence({
          details: ussModificated,
          startTimestamp: Date.now(),
          largeImageKey: 'global',
          largeImageText: ussModificatedU,
          instance: true,
          buttons: [
            { label: 'Download', url: 'https://chrome.google.com/webstore/detail/browser-discord-status/aklnceehjhihdljbcajhdiehaphlafjl'}
          ]
        })
      }

    })
  })
  req.on('error', error => {
    console.log(error)
  })
  req.end()
}
function specialChromeStatusRPC(title, name, image, buttonS, urlS){
  const chars = urlS.split('/');
  if(chars[2] === 'netflix.com' || chars[2] === 'www.netflix.com' ){
    discord.updatePresence({
      state: title,
      startTimestamp: Date.now(),
      largeImageKey: image,
      largeImageText: name,
      smallImageKey: 'playbutton',
      instance: true,
      buttons: [
        { label: buttonS, url: urlS.replace(/\?.*$/g,"")},
        { label: 'Download', url: 'https://chrome.google.com/webstore/detail/browser-discord-status/aklnceehjhihdljbcajhdiehaphlafjl'}
      ]
    });
  }else{
    discord.updatePresence({
      details: name,
      state: title,
      startTimestamp: Date.now(),
      largeImageKey: image,
      largeImageText: name,
      instance: true,
      buttons: [
        { label: buttonS, url: urlS},
        { label: 'Download', url: 'https://chrome.google.com/webstore/detail/browser-discord-status/aklnceehjhihdljbcajhdiehaphlafjl'}
      ]
    });
  }
}
function customChromeStatusRPC(title, name, image){
    discord.updatePresence({
      details: name,
      state: title,
      startTimestamp: Date.now(),
      largeImageKey: image,
      largeImageText: name,
      instance: true,
      buttons: [
        { label: 'Download', url: 'https://chrome.google.com/webstore/detail/browser-discord-status/aklnceehjhihdljbcajhdiehaphlafjl'}
      ]
    });
}