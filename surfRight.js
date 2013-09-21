/**
 * @constructor
 * @struct
 */
function SurfRight() {
	var self = this;
	self.openingDomains = [];
	db.open({
		server: 'testing',
		version: 1,
		schema: {
			usage: {
				key: {
					keyPath: 'id',
					autoIncrement: true
				},
				indexes: {
					timestamp: {},
					domain: {}
				}
			}
		}
	})
		.done(function (s) {
			self.db = s;
			// listening to event
			chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
				if (changeInfo.status !== undefined && changeInfo.status == 'complete') {
					self.Update();
				}
			});
		})
		.fail(function () {
			alert('Cannot connect to browser IndexedDB');
		});
}

SurfRight.prototype.Update = function () {
	var self = this;
	chrome.tabs.query({
		status: "complete",
		url: "*://*/*"
	}, function (tabs) {
		var url = document.createElement('a');
		for (var i = 0; i < tabs.length; i++) {
			url.href = tabs[i].url;
			if (self.openingDomains.indexOf(url.hostname) == -1) {
				self.openingDomains.push(url.hostname);
			}
		}
		var current = new Date();
		$.each(self.openingDomains, function (idx, domain) {
			self.db.usage.query('timestamp')
				.bound(
					Date.UTC(current.getUTCFullYear(),
						current.getUTCMonth(),
						current.getUTCDate()),
					current.getTime())
				.filter('domain', domain)
				.execute()
				.done(function (usages) {
					if (usages.length == 0) {
						self.db.usage.add(new Usage(domain))
							.done(function (usage) {
								console.log("saving ok");
							})
							.fail(function () {
								console.log('error when save Usage to IndexedDB');
							});
					} else {
						var u = new Usage();
						u.id = usages[0].id;
						u.timestamp = usages[0].timestamp;
						u.domain = usages[0].domain;
						u.sum = usages[0].sum;
						u.records = new Array();
						$.each(usages[0].records, function (idx, item) {
							var d = new Duration()
							d.begin = item.begin;
							if (item.end !== undefined) {
								d.end = item.end;
							}
							u.records.push(d);
						})
						self.db.usage.update(u.Record())
							.done(function (info) {
								console.log('updated', info);
							});
					}
				});
		});
	});
};

var surf = new SurfRight();