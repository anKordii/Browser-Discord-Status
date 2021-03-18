var lastInitLogin = 0;

socket = io.connect("ws://localhost:7777")

socket.on('connect', function(){
    alercik('Connected to the server')
});
socket.on('disconnect', function () {
    alercik('Server connection lost')
});
socket.on("currentData", function(){

    if (lastInitLogin > (Date.now() - 4000)) {
      return console.log('Zwolnij.');
    }
    lastInitLogin = Date.now();
    currentPageData();
}); 

chrome.tabs.onActivated.addListener( function(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
        y = tab.url;

        if (!y || ['chrome://', 'about://'].some(p => y.startsWith(p))) return;

        socket.emit("ussDiscordActive", {
            url: y,
            title: tab.title
        });

    });
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {

    if (!change.url || ['chrome://', 'about://'].some(p => change.url.startsWith(p))) return;

    if (tab.active && change.url) {
        
        socket.emit("ussDiscordUpdate", {
            url: change.url,
            title: tab.title
        });         
    }
});

function currentPageData(){
    chrome.tabs.getSelected(null, function(tab) {
        if (!tab.url || ['chrome://', 'about://'].some(p => tab.url.startsWith(p))) return;

        socket.emit("requestedDataChrome", {
            url: tab.url,
            title: tab.title
        });
    });
}

function alercik(title){
    var options = {
        body: title,
        icon: 'icons/128.png',
        dir: "ltr"
    };
    if (Notification.permission === "granted") {
        var notification = new Notification(`Browser Discord Status`, options);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
            if (permission === "granted") {
                var notification = new Notification(`Browser Discord Status`, options);
            }
        });
    } 
}