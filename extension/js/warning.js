function surfRightModalWarning(){
	var WARNING_BOX = document.createElement('div');
	WARNING_BOX.setAttribute('id', 'surfRightModalWarning');
	WARNING_BOX.innerHTML = '<div><h2>WARNING!!!</h2><p>aaaa</p></div>'
	document.body.appendChild(WARNING_BOX);

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		// console.log(sender.tab ?
		// "from a content script:" + sender.tab.url :
		// "from the extension");
		// if (request.greeting == "hello")
		// 	sendResponse({farewell: "goodbye"});
		if(window.location.hostname == request.hostname) {

		}
		document.getElementById("surfRightModalWarning").style.opacity = 1;
	});	
}

if(window.attachEvent) {
    window.attachEvent('onload', surfRightModalWarning);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function() {
            curronload();
            surfRightModalWarning();
        };
        window.onload = newonload;
    } else {
        window.onload = surfRightModalWarning;
    }
}