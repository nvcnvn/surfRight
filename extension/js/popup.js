function PopupManager () {
	var self = this;
	OpenDB()
	.done(function(s) {
		self.db = s;
		self.Display('#content');
	})
	.fail(function() {
		alert('Cannot connect to browser IndexedDB');
	});	
}

PopupManager.prototype.Display = function(container) {
	var self = this;

	var self = this;
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
		windowType: 'normal'
	}, function(tabs) {
		var a = document.createElement('a');
		a.href = tabs[0].url;
		var hostname= a.hostname;
		if(localStorage.getItem('ignoreWWW')) {
			if(hostname.indexOf("www.") == 0) {
				hostname = hostname.slice(4);
			}
		}
		if(hostname != null && hostname.length > 3){
			self.db.usage.get([hostname, getDayUTC(new Date())])
			.done(function(usage){
				$(container).html(hostname);
			}).fail(function(){

			});
		}
	});
};

$(function(){
	var mngr = new PopupManager();
});