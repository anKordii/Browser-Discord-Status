socket = io.connect("ws://localhost:7777")

var lastInitLogin = 0;
if(!localStorage.disableNot){localStorage.disableNot = false;};
if(!localStorage.disableGoogle){localStorage.disableGoogle = false;};
if(!localStorage.disableBing){localStorage.disableBing = false;};
// 👇 Powiadomienie o zainstalowaniu dodatku
if(!localStorage.firstInstalll){ localStorage.firstInstalll = 'none'};
// 👇 Not connected
chrome.browserAction.setBadgeBackgroundColor({ color: "#b30b2f" }); chrome.browserAction.setBadgeText({ text: "OFF" })


socket.on('connect', function(){
    alercik('Connected to the server');
    chrome.browserAction.setBadgeBackgroundColor({ color: "#006b1e" })
    chrome.browserAction.setBadgeText({ text: "ON" })
});
socket.on('disconnect', function () {
    alercik('Server connection lost');
    chrome.browserAction.setBadgeBackgroundColor({ color: "#b30b2f" })
    chrome.browserAction.setBadgeText({ text: "OFF" })
});
socket.on("currentData", function(){

    if (lastInitLogin > (Date.now() - 4000)) {
      return console.log('Zwolnij.');
    }
    lastInitLogin = Date.now();
    
    let querying = browser.tabs.query({currentWindow: true, active: true});
    querying.then(currentPageData);
}); 

chrome.tabs.onActivated.addListener( function(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
        y = tab.url;

        if (!y || ['chrome://', 'about://', 'edge://', 'about:'].some(p => y.startsWith(p))) return;
        if (!y || ['https://www.google.com', 'https://google.com', 'http://www.google.com', 'http://google.com'].some(p => y.startsWith(p) && localStorage.getItem(`disableGoogle`) === 'true')) return;
        if (!y || ['https://www.bing.com', 'https://bing.com', 'http://www.bing.com', 'http://bing.com'].some(p => y.startsWith(p) && localStorage.getItem(`disableBing`) === 'true')) return;
        socket.emit("ussDiscordActive", {
            url: y,
            title: tab.title,
            notSuppoerted: localStorage.disableNot
        });

    });
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {

    if (!change.url || ['chrome://', 'about://', 'edge://', 'about:'].some(p => change.url.startsWith(p))) return;
    if (!change.url || ['https://www.google.com', 'https://google.com', 'http://www.google.com', 'http://google.com'].some(p => change.url.startsWith(p) && localStorage.getItem(`disableGoogle`) === 'true')) return;
    if (!change.url || ['https://www.bing.com', 'https://bing.com', 'http://www.bing.com', 'http://bing.com'].some(p => change.url.startsWith(p) && localStorage.getItem(`disableBing`) === 'true')) return;

    if (tab.active && change.url) {
        
        socket.emit("ussDiscordUpdate", {
            url: change.url,
            title: tab.title,
            notSuppoerted: localStorage.disableNot
        });         
    }
});


function currentPageData(tabs){
    
        if (!tabs[0].url || ['chrome://', 'about://', 'edge://', 'about:'].some(p => tabs[0].url.startsWith(p))) return;
        if (!tabs[0].url || ['https://www.google.com', 'https://google.com', 'http://www.google.com', 'http://google.com'].some(p => tabs[0].url.startsWith(p) && localStorage.getItem(`disableGoogle`) === 'true')) return;
        if (!tabs[0].url || ['https://www.bing.com', 'https://bing.com', 'http://www.bing.com', 'http://bing.com'].some(p => tabs[0].url.startsWith(p) && localStorage.getItem(`disableBing`) === 'true')) return;

        socket.emit("requestedDataChrome", {
            url: tabs[0].url,
            title: tabs[0].title,
            notSuppoerted: localStorage.disableNot
        });
}

function alercik(title){
    chrome.notifications.create({ message: title, title: "Browser Discord Status", type: "basic", iconUrl: "icons/128.png" }, function () { });
}
if (localStorage.firstInstalll == "none") {
    chrome.notifications.create({ message: `Thank you for installing the Browser Discord Status extension. You will display what are u doing in browser on discord.`, contextMessage: "You can controll your status via extension settings and external app.", title: "Welcome to Browser Discord Status", type: "basic", iconUrl: "../../icons/128.png" }, function () { });
    localStorage.setItem('firstInstalll', 'disable');
}