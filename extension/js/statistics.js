function StatisticManager() {
	var self = this;

	OpenDB()
	.done(function(s) {
		self.db = s;
		self.LoadData("all", function(d){
			var n = (10 <= d.data.length)?10:d.data.length;

			var nBarData = [];
			var nBarCol = [];

			var pipeData = [];
			var pipeOther = d.total;
			var pipeLegend = [];
			var pipeHref = []

			for(var i = 0; i < n; i++) {
				var sum = d.data[i].sum;
				pipeOther -= sum;
				pipeData.push(sum);
				pipeHref.push('http://'+d.data[i].hostname);
				pipeLegend.push('%%.%% '+d.data[i].hostname);

				nBarCol.push(d.data[i].hostname);
				nBarData.push(sum);
			}

			pipeLegend.push('%%.%% Others');
			pipeData.push(pipeOther);

		    $('#cTop').highcharts({
		        chart: {
		            type: 'bar'
		        },
		        title: {
				    text: '',
				    style: {
				        display: 'none'
				    }
		        },
		        xAxis: {
		        	categories: nBarCol,
		            title: {
		                text: null
		            },
		            reversed: true
		        },
		        yAxis: {
		            min: 0,
		            title: {
		                text: 'time',
		                align: 'high'
		            },
		            labels: {
		                enabled: false
		            }
		        },
		        tooltip: {
		            formatter: function() {
		            	return milisecondToString(this.y);
		            }
		        },
		        plotOptions: {
		            bar: {
		                colorByPoint: true
		            }
		        },
		        legend: {
		            layout: 'vertical',
		            align: 'right',
		            verticalAlign: 'top',
		            x: -40,
		            y: 100,
		            floating: true,
		            borderWidth: 1,
		            backgroundColor: '#FFFFFF',
		            shadow: true
		        },
		        credits: {
		            enabled: false
		        },
		        series: [{showInLegend: false, data:nBarData}]
		    });
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
					lookup[hostname] = usages[i].sum.sync + usages[i].sum.local;
				}else{
					lookup[hostname] += usages[i].sum.sync + usages[i].sum.local;
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