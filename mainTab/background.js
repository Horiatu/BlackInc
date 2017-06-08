chrome.runtime.onInstalled.addListener(function(details) {
  	chrome.runtime.openOptionsPage(function() {
        var thisVersion = chrome.runtime.getManifest().version;
        if(details.reason == "install" || thisVersion === details.previousVersion)
        {
            console.log("Installed version ", thisVersion);
        }
        else if(details.reason == "update")
        {
            console.log("Updated from " + details.previousVersion + " to " + thisVersion); 
        }
    });
});
