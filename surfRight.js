chrome.webRequest.onCompleted.addListener(function(details){
	console.log(details);
},{urls: ["*://*/*"]});