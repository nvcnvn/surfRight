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

	var hostname= localStorage.getItem('currentHostname');
	if(hostname != null){
		self.db.usage.get([hostname, getDayUTC(new Date())])
		.done(function(usage){
			$(container).html(hostname);
		}).fail(function(){

		});
	}
};

$(function(){
	var mngr = new PopupManager();
});