//  retrieve all tabs in current window
function getTabs() {   
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({
                currentWindow: true //  only care about tabs in current window
            }, function(tabs) {

                let siteArray = [];
                for (var i = 0; i < tabs.length; i++) {
                    siteArray.push(tabs[i]);
                }
                resolve(siteArray); //  return the list of sites if succesful
            });
        } catch (e) {
            reject(e);
        }
    });
}

//  check whether the user has highlighted tabs to create a session out of a set of specific tabs
function checkForHighlighted(tabs) {
    let highlightedTabs = tabs.filter( tab => tab.highlighted == true);

    //  if the filter results in more than one highlighted tabs
    if (highlightedTabs.length > 1) {
        return highlightedTabs;
    }

    return false;
}

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message === "pre_load_tabs") {
        storeCurrentTabs()
        .then(sendResponse(""));
        return true;
    }
});

//  obtains and pre-saves the tabs currently open at the time of opening the extension
async function storeCurrentTabs() {
    var tabs = await getTabs(); //  gets all the tabs open

    var specificTabs = checkForHighlighted(tabs);   //  checks whether any tabs are highlighted
    
    //  stores all tabs into the Chrome API, or only the highlighted ones if there are any
    toChromeStorage((specificTabs == false) ? tabs : specificTabs);

    return true;
}

//  pre-saves the provided tabs into the Chrome API under the name "currentabs"
function toChromeStorage(tabs) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({"currenttabs": tabs}, function(){});
            resolve(0);
        } catch(e) {
            reject(1);
        }
    });
}