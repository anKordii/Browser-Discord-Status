socket = io.connect("ws://localhost:7777")

var lastInitLogin = 0;
if(!localStorage.disableNot){localStorage.disableNot = false;};
if(!localStorage.disableGoogle){localStorage.disableGoogle = false;};
// 👇 Powiadomienie o zainstalowaniu dodatku
if(!localStorage.firstInstalll){ localStorage.firstInstalll = 'none'};
// 👇 Not connected
chrome.browserAction.setBadgeBackgroundColor({ color: "#b30b2f" }); chrome.browserAction.setBadgeText({ text: "Offline" })


socket.on('connect', function(){
    alercik('Connected to the server');
    chrome.browserAction.setBadgeBackgroundColor({ color: "#00bd8a" })
    chrome.browserAction.setBadgeText({ text: "Online" })
});
socket.on('disconnect', function () {
    alercik('Server connection lost');
    chrome.browserAction.setBadgeBackgroundColor({ color: "#b30b2f" })
    chrome.browserAction.setBadgeText({ text: "Offline" })
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
        if (!y || ['https://www.google.com', 'https://google.com', 'http://www.google.com', 'http://google.com'].some(p => y.startsWith(p) && localStorage.getItem(`disableGoogle`) === 'true')) return;
        //if(!y || getStatus(y) == 'blocked' && localStorage.getItem(`disableNot`) === 'true') return;

        socket.emit("ussDiscordActive", {
            url: y,
            title: tab.title
        });

    });
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {

    if (!change.url || ['chrome://', 'about://'].some(p => change.url.startsWith(p))) return;
    if (!change.url || ['https://www.google.com', 'https://google.com', 'http://www.google.com', 'http://google.com'].some(p => change.url.startsWith(p) && localStorage.getItem(`disableGoogle`) === 'true')) return;
    //if (!change.url || getStatus(change.url) == 'blocked' && localStorage.getItem(`disableNot`) === 'true') return;

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
        if (!tab.url || ['https://www.google.com', 'https://google.com', 'http://www.google.com', 'http://google.com'].some(p => tab.url.startsWith(p) && localStorage.getItem(`disableGoogle`) === 'true')) return;
        //if(!tab.url || getStatus(tab.url) == 'blocked' && localStorage.getItem(`disableNot`) === 'true') return;

        socket.emit("requestedDataChrome", {
            url: tab.url,
            title: tab.title
        });
    });
}

function alercik(title){
    chrome.notifications.create({ message: title, title: "Browser Discord Status", type: "basic", iconUrl: "icons/128.png" }, function () { });
}
if (localStorage.firstInstalll == "none") {
    chrome.notifications.create({ message: `Dzięki za zainstalowanie dodatku XayooIndustries Powiadomienia. Będziesz na bieżąco informowany o każdym streamie.`, contextMessage: "Możesz to zmienić klikając lewym przyciskiem na ikone dodatku.", title: "Witaj w Xayoo Industries", type: "basic", iconUrl: "../../icons/128.png" }, function () { });
    localStorage.setItem('firstInstalll', 'disable');
}
/*async function getStatus(url){
    const chars = url.split('/');
    let data = await fetch(`https://api.4uss.cyou/usslist.php?url=${chars[2]}`)
    .then(function(response) {
        if(response.status === 404){
            return response.status;
        }
    });
    return data;
}*/