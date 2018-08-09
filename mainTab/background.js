(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)

})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'); // Note: https protocol here

ga('create', 'UA-109917224-3', 'auto');
ga('set', 'checkProtocolTask', function() {}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('require', 'displayfeatures');
ga('send', 'pageview', '/background.html');

var manifest = chrome.runtime.getManifest();
var thisVersion = manifest.version;
this.versionMsg = manifest.name + " version <b>" + thisVersion + "</b>";

chrome.runtime.onInstalled.addListener(function(details) {
    // console.log(chrome.runtime.getManifest());
    chrome.runtime.openOptionsPage(function(x) {
        this.versionMsg = "Version";
        if(details.reason == "install" || thisVersion === details.previousVersion)
        {
            if(ga) ga('send', 'Installed', 'New Install');
            this.versionMsg = "Installed new version";
        }
        else if(details.reason == "update")
        {
            if(ga) ga('send', 'Installed', 'Update');
            this.versionMsg = "Version updated from " + details.previousVersion + " to";
        }
        console.log(manifest.name + ": " + (this.versionMsg = this.versionMsg + " " + thisVersion));
    });
});