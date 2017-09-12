var manifest = chrome.runtime.getManifest();
var thisVersion = manifest.version;
this.versionMsg = manifest.name + " version <b>" + thisVersion + "</b>";

chrome.runtime.onInstalled.addListener(function(details) {
    // console.log(chrome.runtime.getManifest());
    chrome.runtime.openOptionsPage(function(x) {
        this.versionMsg = "Version";
        if(details.reason == "install" || thisVersion === details.previousVersion)
        {
            this.versionMsg = "Installed new version";
        }
        else if(details.reason == "update")
        {
            this.versionMsg = "Version updated from " + details.previousVersion + " to";
        }
        console.log(manifest.name + ": " + (this.versionMsg = this.versionMsg + " " + thisVersion));
    });
});