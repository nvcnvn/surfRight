function OpenDB() {
	return db.open({
		server: 'surfRight',
		version: 1,
		schema: {
			usage: {
				key: {
					keyPath: ['domain', 'datestamp']
				},
				indexes: {
					datestamp: {},
					timestamp: {}
				}
			},
			rule: {
				key: {
					keyPath: 'domain'				
				},
				indexes: {
					aliases : {
						unique: true,
						multiEntry: true
					}
				}
			}
		}
	});
}

/**
 * @constructor
 * @param {Date} the created time
 * @struct
 */

function Duration(begin) {
	if (begin !== undefined) {
		this.begin = {
			hour: begin.getUTCHours(),
			minute: begin.getUTCMinutes(),
			second: begin.getUTCSeconds()
		};
	}
}

Duration.prototype.Stop = function(end) {
	this.end = {
		hour: end.getUTCHours(),
		minute: end.getUTCMinutes(),
		second: end.getUTCSeconds()
	};
};

/**
 * @return {boolean}
 */
Duration.prototype.Closed = function() {
	if (this.end !== undefined) {
		return true;
	}
	return false;
};

/**
 * @return {int}
 */
Duration.prototype.Sum = function() {
	if (this.end !== undefined) {
		var begin = this.begin.hour * 3600 + this.begin.minute * 60 + this.begin.second;
		var end = this.end.hour * 3600 + this.end.minute * 60 + this.end.second;
		return end - begin;
	}
	return 0;
};

/**
 * @constructor
 * @param {string} domain of the website
 * @struct
 */

function Usage(domain) {
	var current = new Date();
	this.datestamp = getDayUTC(current);
	this.timestamp = current.getTime();
	this.timestr = current.toUTCString();
	this.domain = domain;
	this.sum = 0;
	this.records = [new Duration(current)];
}

Usage.fromObj = function(obj) {
	var u = new Usage();
	u.datestamp = obj.datestamp;
	u.timestamp = obj.timestamp;
	u.domain = obj.domain;
	u.sum = obj.sum;
	u.records = new Array();
	$.each(obj.records, function(idx, item) {
		var d = new Duration()
		d.begin = item.begin;
		if (item.end !== undefined) {
			d.end = item.end;
		}
		u.records.push(d);
	})

	return u;
}

/**
 * @return {Usage}
 */
Usage.prototype.Record = function() {
	var current = new Date();
	var lastRecord = this.records[this.records.length - 1];
	if (lastRecord.Closed()) {
		this.records.push(new Duration(current));
	} else {
		lastRecord.Stop(current);
		this.sum += lastRecord.Sum();
	}
	return this;
};

BLOCK_LEVEL = {
	INFO: 0,
	WARNING: 1,
	STOP: 2
};

BLOCK_WHEN = {
	DAY: 0,
	WEEK: 1,
	MONTH: 2
};
/**
 * @constructor
 * @struct
 */

function BlockInstruction() {
	//give an note when view this website for 30 min per day
	this.level = BLOCK_LEVEL.INFO;
	this.when = BLOCK_WHEN.DAY;
	this.amount = 60*30;
}

/**
 * @constructor
 * @param {string} domain of the website
 * @struct
 */

function Rule(domain) {
	this.domain = domain;
	this.aliases = [];
	this.ignoreWWW = false;
	this.instructions = [];
}