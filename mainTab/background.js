chrome.runtime.onInstalled.addListener(function(details) {
    chrome.runtime.openOptionsPage(function() {
        var thisVersion = chrome.runtime.getManifest().version;
        if(details.reason == "install" || thisVersion === details.previousVersion)
        {
            console.log("BlackInc installed version ", thisVersion);
        }
        else if(details.reason == "update")
        {
            console.log("BlackInc version updated from " + details.previousVersion + " to " + thisVersion); 
        }
    });
});