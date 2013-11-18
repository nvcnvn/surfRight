function StatisticManager() {
	var self = this;

	this.cTop = Raphael("cTop");
	this.cMiddle = Raphael("cMiddle");
	var fin = function () {
	    this.flag = self.cTop.popup(this.bar.x, this.bar.y, milisecondToString(this.bar.value) || "0").insertBefore(this);
	};

	var fout = function () {
	    this.flag.animate({opacity: 0}, 300, function () {this.remove();});
	}

	OpenDB()
	.done(function(s) {
		self.db = s;
		self.LoadData("all", function(d){
			var n = (10 <= d.data.length)?10:d.data.length;
			var datas = [];
			var labels = [];

			var pipeData = [];
			var pipeOther = d.total;
			var pipeLegend = [];
			var pipeHref = []

			for(var i = 0; i < n; i++) {
				pipeOther -= d.data[i].sum;
				pipeData.push(d.data[i].sum);
				pipeHref.push('http://'+d.data[i].hostname);
				pipeLegend.push('%%.%% '+d.data[i].hostname);
				datas.push([d.data[i].sum]);
				labels.push([d.data[i].hostname]);
			}

			pipeLegend.push('%%.%% Others');
			pipeData.push(pipeOther);

			self.cTop.hbarchart(10, 10, (screen.availWidth/100)*90, 220, datas)
			.hover(fin, fout)
			.label(labels);

			var pipe = self.cMiddle.piechart(150, 110, 100, pipeData, {
				legend: pipeLegend,
				sort: false,
				//legendpos: "west",
				href: pipeHref
			}).hover(function () {
                this.sector.stop();
                this.sector.scale(1.1, 1.1, this.cx, this.cy);

                if (this.label) {
                    this.label[0].stop();
                    this.label[0].attr({ r: 7.5 });
                    this.label[1].attr({ "font-weight": 800 });
                }
            }, function () {
                this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

                if (this.label) {
                    this.label[0].animate({ r: 5 }, 500, "bounce");
                    this.label[1].attr({ "font-weight": 400 });
                }
            });
            console.log(pipe);
		})
	})
	.fail(function() {
		alert('Cannot connect to browser IndexedDB');
	});
}

StatisticManager.prototype.LoadData = function(by, callback) {
	var self = this;

	var before;
	var current = new Date();

	switch(by)
	{
	case "day":
		before = getDayUTC(current);
		break;
	case "week":
		before = getWeekUTC(current);
		break;
	default:
		before = getMonthUTC(current);
	}

	self.db.usage
	.query('timestamp')
	.lowerBound(before)
	.execute()
	.done(function(usages){
		self.db.rule
		.query()
		.filter()
		.execute()
		.done(function(rules){
			var lookup = {};
			var i = usages.length;
			loopUsage:
			while(i--){
				//if usage[i] belong to some rule
				var belong = false;
				var hostname;
				var j = rules.length;
				while(j--){
					var aliases = rules[j].aliases;
					var t = aliases.length;
					while(t--){
						if(usages[i].domain == aliases[t]) {
							belong = true;
							hostname = rules[j].domain;
							break;
						}
					}
					if(belong) break;
				}

				if(!belong){
					hostname = usages[i].domain;
				}

				if(typeof lookup[hostname] == 'undefined'){
					lookup[hostname] = usages[i].sum;
				}else{
					lookup[hostname] += usages[i].sum;
				}
			}

			var total = 0;
			var a = [];
			for(var h in lookup){
				total += lookup[h];
				a.push({hostname: h, sum: lookup[h]});
			}
			a.sort(function(a, b){return b.sum-a.sum});

			if(typeof callback == 'function') {
				callback({total: total, data: a});
			}
		})
	});
};

var mngr;
$(function(){
	mngr = new StatisticManager();
})