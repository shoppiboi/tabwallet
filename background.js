console.log("background running");

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

chrome.action.onClicked.addListener(async function() {
    var tabs = await getTabs();

    var specificTabs = checkForHighlighted(tabs);
    if (!specificTabs) {
        console.log("No tabs were highlighted");
    } else {
        console.log("Some tabs were highlighted");
    }
});