/**
 * @constructor
 * @struct
 */
function SurfRight(){
	this.openingDomains = new Array();
}

SurfRight.prototype.tabUpdated = function(tabId, changeInfo, tab){
	var url = $('<a></a>', {
		href: tab.url
	});
	var protocol = url.prop('protocol');
	var domain = url.prop('host');
	url.remove();

	if(protocol == "http:" || protocol == "https:") {
		if(this.openingDomains.indexOf(domain) == -1){
			this.openingDomains.push(domain);
		}
	}
}


var surf = new SurfRight();
// listening to event
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	surf.tabUpdated(tabId, changeInfo, tab);
});