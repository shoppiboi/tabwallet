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

function getSpecificTab() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get('currenttabs', function(result) {

                let highlightedTabs = result.currenttabs.filter(tab => tab.highlighted === true);

                let newTabs = [];

                for (x in highlightedTabs) {
                    newTabs.push(
                        {
                            favIconUrl: highlightedTabs[x].favIconUrl,
                            title: highlightedTabs[x].title,
                            url: highlightedTabs[x].url
                        }
                    );
                }
                
                resolve(newTabs)
            });
        } catch(e) {   
            reject("Could not get current tabs");
        }
    })
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

async function clipboardTab(sessionIndex, tabIndex) {
    let sessionTab = (await getAllSessions())[sessionIndex.split('_')[1]].tabs[tabIndex];

    let copyText = sessionTab.url;

    let el = document.createElement('textarea');
    el.value = copyText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

async function deleteTab(sessionIndex, tabIndex) {
    let allSessions = (await getAllSessions());
    allSessions[sessionIndex.split('_')[1]].tabs.splice(tabIndex, 1);

    let tabs = allSessions[sessionIndex.split('_')[1]].tabs


    if (tabs.length == 0) {
        console.log("Hola como estas");
        deleteSession(sessionIndex.split('_')[1]);
    } else {
        await updateSessions(allSessions);
        initialLoad(allSessions);
    }

    if (tabs.length > 0) {
        renderSessionTabs(sessionIndex, tabs);
    }
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

function renderSessionTabs(sessionIndex, tabs) {
    let tabContainer = document.getElementById(sessionIndex).children[1];

    for (var i = 0; i < tabs.length; i++) {
        tabContainer.appendChild(
            createTabDiv(sessionIndex, i, tabs[i].title, tabs[i].url)
        )
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

async function renameSession(sessionIndex) {
    let allSessions = await getAllSessions();

    var newName = prompt("Please enter new name for session: ");

    allSessions[sessionIndex.split('_')[1]].title = newName;

    await updateSessions(allSessions);
    initialLoad(allSessions);
}

async function addTabToSession(sessionIndex) {
    let highlightedTabs = await getSpecificTab();

    let allSessions = await getAllSessions();

    for (x in highlightedTabs) {
        allSessions[sessionIndex.split('_')[1]].tabs.push(highlightedTabs[x]);
    }

    await updateSessions(allSessions);
    initialLoad(allSessions);
}

async function displaySessionTabs(sessionIndex) {
    let sessionTabs = (await getAllSessions())[sessionIndex.split('_')[1]].tabs;
    renderSessionTabs(sessionIndex, sessionTabs);
}

function createSessionDiv(sessionIndex, sessionTitle, sessionTabCount) {

    let newSessionDiv = document.createElement('div');
    newSessionDiv.className = 'session--div';
    newSessionDiv.id = "session_" + sessionIndex;

    let sessionInfo = document.createElement('div');
    sessionInfo.className = 'session--info';

    let leftContainer = document.createElement('div');
    leftContainer.className = 'sessions--left--container'

    let title = document.createElement('div');
    title.className = 'session--title';
    title.innerHTML = sessionTitle;
    title.onclick = function(){renameSession(newSessionDiv.id)};

    let tabCount = document.createElement('div');
    tabCount.className = 'session--tabcount';
    tabCount.innerHTML = 'Number of tabs: ' + sessionTabCount;
    tabCount.onclick = function(){displaySessionTabs(newSessionDiv.id)}

    leftContainer.appendChild(title);
    leftContainer.appendChild(tabCount);

    let rightContainer = document.createElement('div');
    rightContainer.className = 'sessions--right--container';

    let imgOpenSession = document.createElement('img');
    imgOpenSession.className = 'play--session';
    imgOpenSession.src = 'svgs/play.svg';
    imgOpenSession.title = 'Open Session';
    imgOpenSession.onclick = function(){openClick(newSessionDiv.id)};

    let imgAddTabs = document.createElement('img');
    imgAddTabs.className = 'add--tabs--session';
    imgAddTabs.src = 'svgs/add.svg';
    imgAddTabs.title = 'Add highlighted tabs to Session';
    imgAddTabs.onclick = function(){addTabToSession(newSessionDiv.id)};

    let imgCopySession = document.createElement('img');
    imgCopySession.className = 'copy--session--tabs';
    imgCopySession.src = 'svgs/copy.svg ';
    imgCopySession.title = 'Copy tabs to clipboard';
    imgCopySession.onclick = function(){clipboardSessionTabs(newSessionDiv.id)};

    let imgDeleteSession = document.createElement('img');
    imgDeleteSession.className = 'delete--session';
    imgDeleteSession.src = 'svgs/delete.svg';
    imgDeleteSession.title = 'Delete Session';
    imgDeleteSession.onclick = function(){deleteSession(newSessionDiv.id)};

    rightContainer.appendChild(imgOpenSession);
    rightContainer.appendChild(imgAddTabs);
    rightContainer.appendChild(imgCopySession);
    rightContainer.appendChild(imgDeleteSession);

    sessionInfo.appendChild(leftContainer);
    sessionInfo.appendChild(rightContainer);

    newSessionDiv.appendChild(sessionInfo);

    let tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs--container';

    newSessionDiv.appendChild(tabsContainer);

    return newSessionDiv;
}

function createTabDiv(sessionIndex, tabIndex, tabTitle, tabUrl) {

    let tabInfo = document.createElement('div');
    tabInfo.className = 'tab--info';
    tabInfo.id = 'tab_' + tabIndex;

    let leftContainer = document.createElement('div');
    leftContainer.className = 'tabs--left--container';

    let title = document.createElement('div');
    title.className = 'tab--title';
    title.innerHTML = (
        tabTitle.length > 26 
        ? (tabTitle.substr(0, 26) + '...') : tabTitle
    );
    title.title = tabTitle;

    let url = document.createElement('div');
    url.className = 'tab--url';
    url.innerHTML = (
        tabUrl.length > 37
        ? (tabUrl.substr(0, 37) + '...') : tabUrl
    );
    url.title = tabUrl;

    leftContainer.appendChild(title);
    leftContainer.appendChild(url);

    let rightContainer = document.createElement('div');
    rightContainer.className = 'tabs--right--container';

    let imgCopyTab = document.createElement('img');
    imgCopyTab.className = 'copy--tab';
    imgCopyTab.src = 'svgs/copy.svg'
    imgCopyTab.title = 'Copy tabs to clipboard'
    imgCopyTab.onclick = function(){clipboardTab(sessionIndex, tabIndex)};

    let imgDeleteTab = document.createElement('img');
    imgDeleteTab.className = 'delete--tab';
    imgDeleteTab.src = 'svgs/delete.svg';
    imgDeleteTab.title = 'Delete session';
    imgDeleteTab.onclick = function(){deleteTab(sessionIndex, tabIndex)};

    rightContainer.appendChild(imgCopyTab);
    rightContainer.appendChild(imgDeleteTab);

    tabInfo.appendChild(leftContainer);
    tabInfo.appendChild(rightContainer);

    return tabInfo;

}

function clearSessionDivs() {
    let container = document.getElementById('sessions');

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', async function() {

    // chrome.storage.local.clear();

    chrome.runtime.sendMessage("pre_save_tabs", function(response) {
        console.log(response)
    });

    let initialSessions = await getAllSessions();
    initialLoad((typeof(initialSessions) == 'undefined') ? [] : initialSessions);

    var newSessionButton = document.getElementById('createsession');
    newSessionButton.addEventListener('click', () => {
        createSession();
    }, false);
})