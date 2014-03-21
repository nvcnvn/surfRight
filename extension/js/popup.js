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
		if(tabs.length == 0) {
			return
		}

		var a = document.createElement('a');
		a.href = tabs[0].url;
		var hostname= a.hostname;
		if(localStorage.getItem('ignoreWWW')) {
			if(hostname.indexOf("www.") == 0) {
				hostname = hostname.slice(4);
			}
		}
		if(hostname != null && hostname.length > 3){
			$(container).html(hostname);
			$('#linkSetting').attr('href', 'settings.html#'+hostname);
			
			var now = new Date();
			var sinceMonth = getMonthUTC(now);
			var sinceWeek = getWeekUTC(now);
			var sinceDay = getDayUTC(now);
			self.db.usage
			.query('timestamp')
			.lowerBound(sinceMonth)
			.filter(function(usage){
				var in_aliases = false;
				self.LoadRule(hostname, function(rule){
					$('#linkSetting').attr('href', 'settings.html#'+rule.domain);
					for(var i = 0; i < rule.aliases.length; i++) {
						if(usage.domain == rule.aliases[i]) {
							in_aliases = true;
							break;
						}
					}
				});
				return usage.domain == hostname || in_aliases;
			})
			.execute()
			.done(function(usages){
				var sum = {
					month: 0,
					week: 0,
					day: 0
				};

				for(var i = 0; i < usages.length; i++){
					var total = usages[i].sum.local + usages[i].sum.sync;
					sum.month += total;
					if(usages[i].timestamp >= sinceWeek) {
						sum.week +=total;
					}
					if(usages[i].timestamp >= sinceDay) {
						sum.day += total;
					}
				}

				$('#amountDay').html(milisecondToString(sum.day));
				$('#amountWeek').html(milisecondToString(sum.week));
				$('#amountMonth').html(milisecondToString(sum.month));
			});
		}
	});
};

PopupManager.prototype.LoadRule = function(hostname, callback) {
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
			callback(rule);
		}
	}).fail(function(){
		console.log('falied to get hostname');
	});	
};

$(function(){
	var mngr = new PopupManager();
});