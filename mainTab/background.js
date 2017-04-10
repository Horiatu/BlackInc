chrome.commands.onCommand.addListener(function(command) {
  console.log('onCommand event received for message: ', command);
  switch(command) {
  	case "toggle-blackInk" :
	  	console.log('toggle-blackInk: ', command);
  		break;
  	case "toggle-nightMode" :
  		console.log('toggle-nightMode: ', command);
  		break;
  }
});

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
	alert("BlackInk Little installed.");
	//chrome.runtime.openOptionsPage(function callback)
});

// chrome.tabs.onSelectionChanged.addListener(function(tabId) {
// 	// alert(tabId);
// 	// // lastTabId = tabId;
// 	// // chrome.pageAction.show(lastTabId);
// });

// chrome.browserAction.onClicked.addListener(function(tab) {
//    chrome.tabs.executeScript(null, {file: "testScript.js"});
// });