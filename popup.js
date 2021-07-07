// async function getCurrentTabData() {
//     chrome.runtime.sendMessage("pre_load_tabs", async function(response) {
//         console.log(response);
//     });    
// }

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


document.addEventListener('DOMContentLoaded', function() {

    chrome.runtime.sendMessage("pre_load_tabs", function(response) {
        console.log(response)
    });

    var newSessionButton = document.getElementById('savebutton');
    newSessionButton.addEventListener('click', () => {
        getCurrentTabs();
    }, false);
})