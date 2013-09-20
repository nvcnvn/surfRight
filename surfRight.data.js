/**
 * @constructor
 * @param {Date} the created time
 * @struct
 */
function Duration(begin) {
	this.begin = {
		hour: begin.getUTCHours(),
		minute: begin.getUTCMinutes()
	};
}

Duration.prototype.End = function(end) {
	this.end = {
		hour: end.getUTCHours(),
		minute: end.getUTCMinutes()
	};
};

/**
 * @return {boolean}
 */
Duration.prototype.Closed = function() {
	if(typeof this.end != 'undefined') {
		return true;
	}

	return false;
};

/**
 * @return {int}
 */
Duration.prototype.Sum = function() {
	if(typeof this.end != 'undefined') {
		var begin = this.begin.hour*60 + this.begin.minute;
		var end = this.end.hour*60 + this.end.minute;
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

	this.id = current.UTC();
	this.domain = domain;
	this.sum = 0;
	this.records = [new Duration(current)];
}

/**
 * @return {Usage}
 */
Usage.prototype.Record = function() {
	var current = new Date();
	var lastRecord = this.records[this.records.length-1];

	if(lastRecord.Closed()) {
		this.records.push(new Duration(current));
	}else{
		lastRecord.End(current);
		this.sum += lastRecord.Sum();
	}

	return this;
};
