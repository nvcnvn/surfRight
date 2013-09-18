function Usage‎(domain) {
	this.Domain = domain;
	var current = new Date();
	this.Start = {
		hour: current.getHours(),
		minute: current.getMinutes()
	};

	this.End = {
		hour: 0,
		minute: 0
	}
}
