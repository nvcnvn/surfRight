/**
 * @constructor
 * @struct
 */

function SurfRight() {
	var self = this;
	var test = Date.now();

	self.ignoreWWW = true;
	self.openingDomains = [];
	self._queueUpdate = [];
	self._isUpdating = false;
	
	OpenDB()
	.done(function(s) {
		self.db = s;
		console.log('db connected', Date.now()-test);
		// listening to event
		chrome.tabs.onActivated.addListener(function(activeInfo){
			self.GetViewingTab(function(tab){
				self._enqueue(function(){
					console.log('tab active changed', tab.url);
					self.Update(tab.url);
				});					
			});
		});
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			if (changeInfo.status == 'complete' && typeof tab.url != 'undefined') {
				self.GetViewingTab(function(tab){
					self._enqueue(function(){
						console.log('tab address changed', tab.url);
						self.Update(tab.url);
					});
				});
			}
		});
		chrome.windows.onFocusChanged.addListener(function(windowId){
			self.GetViewingTab(function(tab){
				self._enqueue(function(){
					console.log('windows active changed', tab.url);
					self.Update(tab.url);
				});
			});
		});

		chrome.tabs.onRemoved.addListener(function(){

		});

		chrome.windows.onRemoved.addListener(function(windowId){
			chrome.windows.getAll({}, function(windows){
				if(windows.length == 0) {
					self._enqueue(function(){
						console.log('browser closed')
						self.Update("not://valid/url");
					});
				}
			});
		});
	})
	.fail(function() {
		alert('Cannot connect to browser IndexedDB');
	});
}

SurfRight.prototype.GetViewingTab = function(callback) {
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
		windowType: 'normal'
	}, function(tabs) {
		if(typeof callback == 'function' && tabs.length == 1) {
			callback(tabs[0]);
		}
	});
};


SurfRight.prototype._nextUpdate = function() {
	var self = this;
	if(self._queueUpdate.length){
		(self._queueUpdate.shift())();
	}
}

SurfRight.prototype._enqueue = function(f) {
	var self = this;
	if(typeof f == 'function'){
		self._queueUpdate.push(f);
		if(!self._isUpdating && self._queueUpdate.length > 0){
			self._nextUpdate();
		}
	}
}

SurfRight.prototype.LoadRule = function(hostname, callback) {
	var self = this;
	self._isUpdating = true;

	self.db.rule
	.get(hostname)
	.done(function(rule) {
		if(typeof rule == 'undefined') {
			self.db.rule
			.query('aliases')
			.only(hostname)
			.execute()
			.done(function(rules){
				if(rules.length > 0) {
					callback(rules[0]);
				}else{
					callback();
				}
			})
			.fail(function(){
				console.log('falied to query hostname on aliases');
			});
		}else{
			callback(rules);
		}
	}).fail(function(){
		console.log('falied to get hostname');
	});	
};

SurfRight.prototype.SaveUsage = function(hostname, done, fail) {
	var self = this;

	self.db.usage
	.get([hostname, getDayUTC(new Date())])
	.done(function(usage) {
		if(typeof usage == 'undefined') {
			//Insert new Usage to database
			self.db.usage.add(new Usage(hostname))
			.done(function(){
				if(typeof done == 'function') done();
			})
			.fail(function(){
				if(typeof fail == 'function') fail();
			});
		}else{
			//Update saved usage of the day
			self.db.usage.update(Usage.fromObj(usage).Record())
			.done(function(){
				if(typeof done == 'function') done();
			})
			.fail(function(){
				if(typeof fail == 'function') fail();
			});
		}
	}).fail(function(){
		self.db.usage.add(hostname)
		.done(function(){
			if(typeof done == 'function') done();
		})
		.fail(function(){
			if(typeof fail == 'function') fail();
		});
	});
};

SurfRight.prototype.validURL = function(url) {
	if(url.protocol != "http:" && url.protocol != "https:") {
		return false;
	}

	return true;
};

SurfRight.prototype.currentHostname = function(hostname) {
	if(typeof hostname != 'undefined'){
		if(hostname == 0) {
			localStorage.removeItem('currentHostname');
			return;
		}

		localStorage.setItem('currentHostname', hostname);
		return;
	}

	return localStorage.getItem('currentHostname');
};

SurfRight.prototype.Update = function(url) {
	var self = this; 

	var a = document.createElement('a');
	a.href = url;

	var valid = self.validURL(a);

	var hostname = a.hostname;
	if(self.ignoreWWW) {
		if(hostname.indexOf("www.") == 0) {
			hostname = hostname.slice(4);
		}
	}
	
	self._isUpdating = true;			
	var currentHostname = self.currentHostname();
	if(currentHostname == null) {
		//begin for the new one
		if(valid) {
			self.SaveUsage(hostname, function(){
				self.currentHostname(hostname);
				self._isUpdating = false;
				self._nextUpdate();
			});
		}else{
			self._isUpdating = false;
			self._nextUpdate();
		}
	}else{
		if(currentHostname != hostname) {
			//update the record for the old tab
			self.SaveUsage(self.currentHostname(), function(){
				if(valid) {
					self.SaveUsage(hostname, function(){
						self.currentHostname(hostname);
						self._isUpdating = false;
						self._nextUpdate();
					});
				}else{
					self.currentHostname(0);
					self._isUpdating = false;
					self._nextUpdate();
				}
			});
		}else{
			self._isUpdating = false;
			self._nextUpdate();		
		}
	}
}

var surf = new SurfRight();