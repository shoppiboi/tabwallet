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

//  retrieves and returns all the Sessions stored in chrome.storage.local
function getAllSessions() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get("sessions", function(result) {
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
        title: "Session " + ((typeof(allSessions) == 'undefined') ? 1 : (allSessions.length + 1)),
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
    initialLoad(allSessions);
}

async function deleteSession(sessionIndex) {

    console.log("Session to be deleted ID: ", sessionIndex.split('_')[1]);

    let allSessions = await getAllSessions();

    let updatedSessions = [];

    if (allSessions.length > 1) {
        for (var i = 0; i <= allSessions.length - 1; i++) {
            if (i != Number(sessionIndex.split('_')[1])) {
                updatedSessions.push(allSessions[i]);
            }
        }
    }
    
    await updateSessions(updatedSessions);
    initialLoad(updatedSessions);
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

function initialLoad(loadedSessions) {
    clearSessionDivs();

    let elementNoSessionsText = document.getElementById('nosessionstext');

    console.log("Number of sessions: ", loadedSessions.length);

    if (loadedSessions.length > 0) {
        elementNoSessionsText.style.display = 'none';
        renderSessions(loadedSessions);
    } else {
        elementNoSessionsText.style.display = 'block';
    }
}

function renderSessions(sessions) {
    let sessionContainer = document.getElementById('sessions');

    for (var i = 0; i < sessions.length; i++) {
        sessionContainer.appendChild(
            createSessionDiv(i, sessions[i].title, sessions[i].tabs.length)
        );
    }
}

async function clipboardSessionTabs(sessionIndex) {
    let sessionTabs = (await getAllSessions())[sessionIndex.split('_')[1]].tabs;

    let copyText = (function(){
        let links = "";
        
        for (var i = 0; i <= sessionTabs.length - 1; i++) {
            links += sessionTabs[i].url + '\n';
        }

        return links;
    })();

    let el = document.createElement('textarea');
    el.value = copyText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

async function openClick(sessionIndex) {

    let session = (await getAllSessions())[sessionIndex.split('_')[1]];

    for (tab in session.tabs) {

        console.log(session.tabs[tab]);

        // console.log(tabs.url[link])

        openTab(session.tabs[tab].url);
    }
}

function openTab(url) {
    chrome.tabs.create({url: url});
}

function renameSession(sessionIndex, titleElement) {

    console.log(document.getElementById((sessionIndex)));

    let sessionTitle = document.getElementById((sessionIndex)).querySelector('.session--title');

    titleElement.contentEditable = true;

    // titleElement.contenteditable = true;

    // sessionDiv.contentEditable = true;


}

function createSessionDiv(sessionIndex, sessionTitle, sessionTabCount) {

    let newDiv = document.createElement('div');
    newDiv.id = "session_" + sessionIndex;
    newDiv.className = 'session--div';

    let imgShowTabs = document.createElement('img');
    imgShowTabs.className = 'show--tabs';
    imgShowTabs.src = 'svgs/down.svg';
    imgShowTabs.title = 'Display tabs';

    let imgRenameSession = document.createElement('img');
    imgRenameSession.className = 'play--session';
    imgRenameSession.src = 'svgs/play.svg';
    imgRenameSession.title = 'Open Session';
    imgRenameSession.onclick = function(){openClick(newDiv.id)};    //  insert function for opening session

    let imgCopySession = document.createElement('img');
    imgCopySession.className = 'copy--session--tabs';
    imgCopySession.src = 'svgs/copy.svg ';
    imgCopySession.title = 'Copy tabs to clipboard';
    imgCopySession.onclick = function(){clipboardSessionTabs(newDiv.id)};

    let imgDeleteSession = document.createElement('img');
    imgDeleteSession.className = 'delete--session';
    imgDeleteSession.src = 'svgs/delete.svg';
    imgDeleteSession.title = 'Delete Session';
    imgDeleteSession.onclick = function(){deleteSession(newDiv.id)};

    let title = document.createElement('div');
    title.className = 'session--title';
    title.innerHTML = sessionTitle;
    title.onclick = function(){renameSession(newDiv.id, title)};

    let tabCount = document.createElement('div');
    tabCount.className = 'session--tabcount';
    tabCount.innerHTML = 'Number of tabs: ' + sessionTabCount;


    newDiv.appendChild(imgShowTabs);
    newDiv.appendChild(imgRenameSession);
    newDiv.appendChild(imgCopySession);
    newDiv.appendChild(imgDeleteSession);
    newDiv.appendChild(title);
    newDiv.append(tabCount);

    return newDiv;
}

function clearSessionDivs() {
    let container = document.getElementById('sessions');

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', async function() {

    chrome.storage.local.clear();

    chrome.runtime.sendMessage("pre_save_tabs", function(response) {
        console.log(response)
    });

    let initialSessions = await getAllSessions();
    console.log(initialSessions);
    // initialLoad((typeof(initialSessions) == 'undefined') ? [] : initialSessions);

    var newSessionButton = document.getElementById('createsession');
    newSessionButton.addEventListener('click', () => {
        createSession();
    }, false);
})