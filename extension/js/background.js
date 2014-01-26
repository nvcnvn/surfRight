/**
 * @constructor
 * @struct
 */

function SurfRight() {
	var self = this;
	self.ignoreWWW = true;
	self.openingDomains = [];
	self._queueUpdate = [];
	self._isUpdating = false;
	self._current = {
		hostname: function(h){
			return sessionStorageSetGet('currentHostname', h);
		},
		timestamp: function(t) {
			return sessionStorageSetGet('currentTimestamp', t);
		}
	};

	if(localStorage.getItem('lastSync') == null) {
		//the first time extension run, setup some setting
		localStorage.setItem('ignoreWWW', true);
	}

	OpenDB()
	.done(function(s) {
		self.db = s;
		// listening to event
		chrome.tabs.onActivated.addListener(function(activeInfo){
			self.GetViewingTab(function(tab){
				self._enqueue(function(){
					console.log('tab active changed', tab.url);
					self.Update(Date.now(), tab.url);
				});					
			});
		});
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			if (changeInfo.status == 'complete' && typeof tab.url != 'undefined') {
				self.GetViewingTab(function(tab){
					self._enqueue(function(){
						console.log('tab address changed', tab.url);
						self.Update(Date.now(), tab.url);
					});
				});
			}
		});

		chrome.windows.onFocusChanged.addListener(function(windowId){
			if(windowId == chrome.windows.WINDOW_ID_NONE){
				self._enqueue(function(){
					console.log('all windows hided');
					self.Update(Date.now(), "not://valid/url");
				});
			}else{
				self.GetViewingTab(function(tab){
					self._enqueue(function(){
						console.log('windows active changed', tab.url);
						self.Update(Date.now(), tab.url);
					});
				});
			}
		});

		chrome.alarms.create("surfRight", {
			periodInMinutes: 1
		});
		chrome.alarms.onAlarm.addListener(function(alarm){
			self.GetViewingTab(function(tab){
				self._enqueue(function(){
					console.log('one minute away...', tab.url);
					self.Update(Date.now(), tab.url);
				});
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

SurfRight.prototype.validURL = function(url) {
	if(url.protocol != "http:" && url.protocol != "https:") {
		return false;
	}

	return true;
};

SurfRight.prototype.Update = function(timestamp, url) {
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
	
	var fnUpdateNext = function(){
		self._isUpdating = false;
		self._nextUpdate();					
	};
	var fnUpdateNextOK = function(){
		if(valid){
			self._current.hostname(hostname);
			self._current.timestamp(timestamp);
		}else{
			self._current.hostname(null);
			self._current.timestamp(null);
		}
		fnUpdateNext();
	};
	var fnNewUsage = function(hostname, timestamp, duration){
		var u = new Usage(hostname);
		u.Record('local', (new Date(timestamp)).getUTCHours(), duration);
		return u;
	};

	self._isUpdating = true;			
	if(self._current.hostname() == null){
		//begin for the new session
		if(valid) {
			self._current.hostname(hostname);
			self._current.timestamp(timestamp);
		}
		fnUpdateNext();
	}else{
		var duration = timestamp - self._current.timestamp();

		self.db.usage
		.get([self._current.hostname(), getDayUTC(new Date(timestamp))])
		.done(function(usage) {
			if(typeof usage == 'undefined') {
				//Insert new Usage to database
				self.db.usage.add(fnNewUsage(self._current.hostname(), timestamp, duration))
				.done(fnUpdateNextOK)
				.fail(fnUpdateNext);
			}else{
				//Update saved usage of the day
				var u = Usage.fromObj(usage);
				u.Record('local', (new Date(timestamp)).getUTCHours(), duration);

				self.db.usage.update(u)
				.done(fnUpdateNextOK)
				.fail(fnUpdateNext);
			}
		}).fail(function(){
			self.db.usage.add(fnNewUsage(self._current.hostname(), timestamp, duration))
			.done(fnUpdateNextOK)
			.fail(fnUpdateNext);
		});
	}
}

var surf = new SurfRight();