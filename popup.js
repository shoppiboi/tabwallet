
//  object for each specific tab
class Tab {
    constructor(title, url, icon) {
        this.title = title;
        this.url = url;
        this.icon = icon;
    }
}

//  contains the information regarding the Session and its individual tabs
class Session {
    constructor(name) {
        this.name = name;
        this.sites = [];
    }

    //  add a Tab to the Session
    addTab(tab) {
        this.tabs.push(tab);
    }

    deleteTab(tabIndex) {
        //  insert code to delete specific Tab from a Session 
    }
}

function getCurrentTabs() {

    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get('currenttabs', function(results) {
                console.log(results);
                resolve(results.currenttabs);
            })
        } catch(e) {
            reject(1);
        }
    });
}

//  uses the pre-saved tabs to create a new session
function createSession() {

    

}

document.addEventListener('DOMContentLoaded', function() {

    chrome.runtime.sendMessage("pre_save_tabs", function(response) {
        console.log(response)
    });

    var newSessionButton = document.getElementById('savebutton');
    newSessionButton.addEventListener('click', () => {
        getCurrentTabs();
    }, false);
})