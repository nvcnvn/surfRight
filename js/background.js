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
			chrome.tabs.get(activeInfo.tabId, function(tab){
				self.Update(tab);
			});
		});
		// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		// 	if (changeInfo.status !== undefined && changeInfo.status == 'complete') {
		// 		self.Update(tab);
		// 	}
		// });
	})
	.fail(function() {
		alert('Cannot connect to browser IndexedDB');
	});
}

SurfRight.prototype.LoadSetting = function(hostname, callback) {
	var self = this;

	self.db.setting
	.get(hostname)
	.done(function(setting) {
		if(typeof setting == 'undefined') {
			self.db.setting
			.query('aliases')
			.only(hostname)
			.execute()
			.done(function(settings){
				if(settings.length > 0) {
					callback(settings[0]);
				}else{
					callback();
				}
			})
			.fail(function(){
				console.log('falied to query hostname on aliases');
			});
		}else{
			callback(setting);
		}
	}).fail(function(){
		console.log('falied to get hostname');
	});	
};

SurfRight.prototype.CreateUsage = function(hostname, callback) {
	var self = this;

	self.db.usage.add(new Usage(hostname))
	.done(function() {
		if(typeof callback != 'undefined') {
			callback();
		}
		console.log("saving new Usage to IndexedDB");
	})
	.fail(function() {
		console.log('error when save Usage to IndexedDB');
	});
};

SurfRight.prototype.Update = function(tab) {
	var self = this;

	var url = document.createElement('a');
	url.href = tab.url;
	if(url.protocol != "http:" && url.protocol != "https:") {
		console.log("Invlaid protocol", url.protocol);
		return;
	}
	var hostname = url.hostname;
	if(self.ignoreWWW) {
		if(hostname.indexOf("www.") == 0) {
			hostname = hostname.slice(4);
		}
	}

	if(typeof self.currentHostname == 'undefined') {
		//begin for the new one
		self.CreateUsage(hostname);
		self.currentHostname = hostname;
	}else{
		if(self.currentHostname != hostname) {
			//update the record for the old tab
			self.LoadSetting(self.currentHostname, function(st){
				var current = new Date();
				var domain;
				if(typeof st == 'undefined') {
					domain = self.currentHostname;
				}else{
					domain = st.domain;
				}
				self.db.usage
				.get([domain, getDayUTC(current)])
				.done(function(usage) {
					if (typeof usage == 'undefined') {
						self.CreateUsage(domain, function() {
							self.currentHostname = hostname;
						});
					} else {
						var u = new Usage();
						u.datestamp = usage.datestamp;
						u.timestamp = usage.timestamp;
						u.domain = usage.domain;
						u.sum = usage.sum;
						u.records = new Array();
						$.each(usage.records, function(idx, item) {
							var d = new Duration()
							d.begin = item.begin;
							if (item.end !== undefined) {
								d.end = item.end;
							}
							u.records.push(d);
						})
						self.db.usage.update(u.Record())
						.done(function(info) {
							//then begin for the new one
							self.CreateUsage(hostname);
							self.currentHostname = hostname;
							console.log('updated Usage', info);
						});
					}
				});
			});
		}
		//else do nothing
	}
}

var surf = new SurfRight();