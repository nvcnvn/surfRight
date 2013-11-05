/**
 * @constructor
 * @struct
 */

function SurfRight() {
	var self = this;

	self.ignoreWWW = true;
	self.openingDomains = [];
	
	OpenDB()
	.done(function(s) {
		self.db = s;
		// listening to event
		chrome.tabs.onActivated.addListener(function(activeInfo){
			if(typeof activeInfo != undefined) {
				chrome.tabs.get(activeInfo.tabId, function(tab){
					console.log('tab active changed');
					self.Update(tab.url);
				});
			}
		});
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			if (changeInfo.status !== undefined && changeInfo.status == 'complete') {
				console.log('tab address changed');
				self.Update(tab.url);
			}
		});
		chrome.windows.onFocusChanged.addListener(function(windowId){
			chrome.tabs.query({
				active: true,
				windowId: windowId
			}, function(tabs) {
				if(tabs.length == 1) {
					chrome.tabs.get(tabs[0].id, function(tab){
						console.log('windows active changed');
						self.Update(tab.url);
					});
				}
			});			
		});
		chrome.windows.onRemoved.addListener(function(windowId){
			chrome.tabs.query({}, function(tabs){
				if(tabs.length == 0) {
					console.log(tabs.length, "tab(s) opening");
					self.Update("not://valid/url");
				}
			});
		});
	})
	.fail(function() {
		alert('Cannot connect to browser IndexedDB');
	});
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
		console.log("Invlaid protocol", url.protocol);
		return false;
	}

	return true;
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

	if(typeof self.currentHostname == 'undefined') {
		//begin for the new one
		if(valid) {
			self.SaveUsage(hostname, function(){
				self.currentHostname = hostname;
			});
		}
	}else{
		if(self.currentHostname != hostname) {
			//update the record for the old tab
			self.SaveUsage(self.currentHostname, function(){
				if(valid) {
					self.SaveUsage(hostname, function(){
						self.currentHostname = hostname;
					});
				}else{
					self.currentHostname = undefined;
				}
			});
		}
	}
}

var surf = new SurfRight();