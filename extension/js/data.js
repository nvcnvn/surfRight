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
 * @param {string} domain of the website
 * @struct
 */

function Usage(domain) {
	var current = new Date();
	this.datestamp = getDayUTC(current);
	this.timestamp = current.getTime();
	this.timestr = current.toUTCString();
	this.domain = domain;
	this.sum = {
		sync: 0,
		local: 0
	};
	this.records = {
		sync: [],
		local: []
	};
	for(var i=0;i<24;i++) {
		this.records.sync.push(0);
		this.records.local.push(0);
	}
}

Usage.fromObj = function(obj) {
	var u = new Usage();
	u.datestamp = obj.datestamp;
	u.timestamp = obj.timestamp;
	u.domain = obj.domain;
	u.sum = obj.sum;
	u.records = obj.records;

	return u;
}

/**
 * @return {Usage}
 */
Usage.prototype.Record = function(where, when, duration) {
	if(where == "sync"){
		this.records.sync[when] += duration;
		this.sum.sync += duration;
	}else{
		this.records.local[when] += duration;
		this.sum.local += duration;
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