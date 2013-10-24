function locale(key) {
	return chrome.i18n.getMessage(key);
}

function getDayUTC(d) {
	return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function getWeekUTC(d) {
	var day = d.getDay();
	return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getDate() - day + (day == 0 ? -6:1));
}

function getMonthUTC(d) {
	return Date.UTC(d.getUTCFullYear(), d.getUTCMonth());	
}