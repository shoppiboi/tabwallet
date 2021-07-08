function getCurrentTabs() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get("currenttabs", function(result) {
                resolve(result.currenttabs);
            });
        } catch(e) {
            reject("Couldn't get current tabs.");
        }
    });
}

function getAllSessions() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get("sessions", function(result) {
                console.log(result.sessions);
                resolve(
                        (typeof(result.sessions) === "undefined") ? [] : result.sessions
                );
            });
        } catch(e) {
            reject("Couldn't get all sessions");
        }
    });
}

//  uses the pre-saved tabs to create a new session
async function createSession() {
    let allSessions = await getAllSessions();

    //  create a Session object in a format that can be JSONified
    var newSession = {
        name: "Session " + (allSessions.length + 1),
        tabs: []
    };

    console.log("The new session is: ", newSession);    //  testing

    //  add tabs to the new session
    await getCurrentTabs()
    .then(function(currentTabs) {
        for (x in currentTabs) {
            newSession.tabs.push(
                {
                    title: currentTabs[x].title,
                    url: currentTabs[x].url,
                    favIconUrl: currentTabs[x].favIconUrl
                }
            );
        }
    });

    allSessions.push(newSession);
    await updateSessions(allSessions);
}

//  pre-saves the provided tabs into the Chrome API under the name "currentabs"
function updateSessions(sessions) {
    console.log("Session to save: ", sessions);  //  
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({"sessions": sessions}, function(){});
            resolve(0);
        } catch(e) {
            reject(1);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {

    chrome.storage.local.clear();

    let gang = await getAllSessions();
    console.log(gang);

    chrome.runtime.sendMessage("pre_save_tabs", function(response) {
        console.log(response)
    });

    var newSessionButton = document.getElementById('savebutton');
    newSessionButton.addEventListener('click', () => {
        createSession();
    }, false);
})