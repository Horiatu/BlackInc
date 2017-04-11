// chrome.commands.onCommand.addListener(function(command) {
//   console.log('onCommand event received for message: ', command);
//   switch(command) {
//   	case "toggle-blackInk" :
// 	  	console.log('toggle-blackInk: ', command);
//   		break;
//   	case "toggle-nightMode" :
//   		console.log('toggle-nightMode: ', command);
//   		break;
//   }
// });

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
