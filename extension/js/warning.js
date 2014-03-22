function surfRightModalWarning(){
	var WARNING_BOX = document.createElement('div');
	WARNING_BOX.setAttribute('id', 'surfRightModalWarning');
	WARNING_BOX.innerHTML = '<div><a id="surfRightModalWarningClose">X</a><div>\
	<p style="float: left;"><img id="surfRightModalWarningICon" style="height:200px;width:200px"></p>\
	<p id="surfRightModalWarningMessage"></p><div style="clear:both;"></div>\
	</div></div>';
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
				document.getElementById('surfRightModalWarningICon')
				.setAttribute('src','chrome-extension://'+chrome.i18n.getMessage("@@extension_id")+'/img/stop.png');
				btClose.style.display = 'none';
			}else{
				if(request.instructions.level == BLOCK_LEVEL.WARNING) {
				document.getElementById('surfRightModalWarningICon')
				.setAttribute('src','chrome-extension://'+chrome.i18n.getMessage("@@extension_id")+'/img/warrning.png');
				}else{
				document.getElementById('surfRightModalWarningICon')
				.setAttribute('src','chrome-extension://'+chrome.i18n.getMessage("@@extension_id")+'/img/info.png');
				}
				btClose.style.display = 'inline';
			}

			document.getElementById('surfRightModalWarningMessage')
			.innerHTML = 'Your time for <div>'+hostname+'</div> now over '+(request.instructions.amount/60)+' hours';
			
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