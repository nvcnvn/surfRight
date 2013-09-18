/**
 * @constructor
 * @param {string} domain of the website
 * @struct
 */
function Usage(domain) {
	this.domain = domain;
	var current = new Date();
	this.start = {
		hour: current.getHours(),
		minute: current.getMinutes()
	};

	this.end = {
		hour: 0,
		minute: 0
	}
}

/**
 * @return {Usage}
 */
Usage.prototype.End = function() {
	var current = new Date();
	this.end = {
		hour: current.getHours(),
		minute: current.getMinutes()
	};

	return this;
};
