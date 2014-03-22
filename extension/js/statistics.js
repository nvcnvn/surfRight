function StatisticManager() {
	var self = this;

	OpenDB()
	.done(function(s) {
		self.db = s;
		self.LoadData("all", self.DrawChart)
	})
	.fail(function() {
		alert('Cannot connect to browser IndexedDB');
	});
}

StatisticManager.prototype.DrawChart = function(d) {
	var n = (10 <= d.data.length)?10:d.data.length;

	var nBarData = [];
	var nBarCol = [];

	var pipeData = [];
	var pipeOther = d.total;

	for(var i = 0; i < n; i++) {
		var sum = d.data[i].sum;
		pipeOther -= sum;
		pipeData.push([d.data[i].hostname, sum]);

		nBarCol.push(d.data[i].hostname);
		nBarData.push(sum);
	}

	pipeData.push(["Others", pipeOther]);

    $('#hostnameBarChart').highcharts({
        chart: {
            type: 'bar',
            backgroundColor: {
            	linearGradient: { x1: 1, y1: 1, x2: 1, y2: 0 },
			    stops: [
			        [0, '#bbb'],
			        [1, '#ddd']
			    ]
            },
            marginLeft: 65
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
            reversed: true,
            labels: {
            	x: 5,
            	y: 5,
                align: 'left',
                style: {
                    fontSize: '1.5em',
                    color: 'white'
                }
            }
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
                colorByPoint: true,
                point: {
                	events: {
                		click: function(){
                			location.href = 'settings.html#'+this.category;
                		}
                	}
                }
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

    $('#hostnamePipeChart').highcharts({
        chart: {
            backgroundColor: {
            	linearGradient: { x1: 1, y1: 1, x2: 1, y2: 0 },
			    stops: [
			        [0, '#bbb'],
			        [1, '#ddd']
			    ]
            },
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true,
                point: {
                	events: {
                		click: function(){
                			if(this.name != "Others"){
                				location.href = 'settings.html#'+this.name;
                			}
                		}
                	}
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: pipeData
        }]
    });
			
};

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
	case "month":
		before = getMonthUTC(current);
		break;
	default:
		before = 0;
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
	$('#slRange').change(function(){
		mngr.LoadData($(this).val(), mngr.DrawChart);
	});
})