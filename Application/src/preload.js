const { ipcRenderer } = require('electron')
var ussupdate = 0;
process.once('loaded', () => {
    ipcRenderer.on("statusDownload", (event, data) => {
        document.getElementById("vod-status").innerHTML = data;
    });
    ipcRenderer.on("outdated", (event, data) => {
        if(ussupdate === 0){
            ussupdate = 1
            alert(data)
        }
    });
    window.addEventListener('message', evt => {
        if(evt.data.type === 'close-app'){
            ipcRenderer.send('close-app')
        }else if(evt.data.type === 'minimize-app'){
            ipcRenderer.send('minimize-app')
        }else if(evt.data.type === 'enable-socket'){
            ipcRenderer.send('enable-socket')
        }else if(evt.data.type === 'disable-socket'){
            ipcRenderer.send('disable-socket')
        }
    })
})