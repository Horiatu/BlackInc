var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-109917224-3']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

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