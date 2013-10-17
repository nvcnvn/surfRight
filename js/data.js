function OpenDB() {
	return db.open({
		server: 'testing',
		version: 2,
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
			},
			setting: {
				key: {
					keyPath: 'id',
					autoIncrement: true					
				},
				indexes: {
					domain: {},
					aliases : {}
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
	this.timestamp = current.getTime();
	this.timestr = current.toUTCString();
	this.domain = domain;
	this.sum = 0;
	this.records = [new Duration(current)];
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
	INFO: {val: 0},
	WARNING: {val: 1},
	STOP: {val: 2}
};

BLOCK_WHEN = {
	DAY: {val: 0},
	WEEK: {val: 1},
	MONTH: {val: 2}
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

function Setting(domain) {
	this.domain = domain;
	this.aliases = [];
	this.ignoreWWW = false;
	this.instructions = [];
}

Setting.prototype.AddAliases = function(aliases) {
	var self = this;
	if(typeof aliases == "string" || aliases instanceof String) {
		// $.each(aliases.split(","), function(idx, item) {
		// 	var alias = $.trim(item);
		// 	//should be 3 here?
		// 	if(alias.length > 3) {

		// 	}
		// });
		self.aliases.push(aliases);
	} else if(typeof aliases == "array" || aliases instanceof Array) {
		$.each(aliases, function(idx, item){
			if(typeof item == "string" || item instanceof String) {
				self.aliases.push(item);
			}
		});
	}
};