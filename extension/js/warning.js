function surfRightModalWarning(){
	var WARNING_BOX = document.createElement('div');
	WARNING_BOX.setAttribute('id', 'surfRightModalWarning');
	WARNING_BOX.innerHTML = '<div><a id="surfRightModalWarningClose">X</a><h2 id="surfRightModalWarningTitle"></h2><p id="surfRightModalWarningMessage"></p></div>'
	document.body.appendChild(WARNING_BOX);

	var btClose = document.getElementById('surfRightModalWarningClose');
	btClose.addEventListener('click', function(){
		WARNING_BOX.style.opacity = 0;
		WARNING_BOX.style.pointerEvents = 'none';
	}, false);

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		var hostname = window.location.hostname;
		if(request.ignoreWWW) {
			if(hostname.indexOf("www.") == 0) {
				hostname = hostname.slice(4);
			}
		}

		if(hostname == request.hostname) {
			if(request.instructions.level == BLOCK_LEVEL.STOP) {
				document.getElementById('surfRightModalWarningTitle')
				.innerText = 'STOP!!!'
				document.getElementById('surfRightModalWarningMessage')
				.innerText = 'Your time for '+hostname+' now over '+(request.instructions.amount/60)+' hours';
				btClose.style.display = 'none';
			}else{
				btClose.style.display = 'inline';
			}

			WARNING_BOX.style.opacity = 1;
			WARNING_BOX.style.pointerEvents = 'auto';
		}
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