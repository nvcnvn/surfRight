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

function milisecondToString(m){
	var min = 1000*60;
	var hour = 60*min;
	var day = 24*hour;
	var week = 7*day;
	var month = 30*day;

	if(m>=month){
		var fract = m/month;
		var num = Math.floor(fract);
		return num + " month " + milisecondToString((fract-num)*month);
	}else if(m>=week){
		var fract = m/week;
		var num = Math.floor(fract);
		return num + " week " + milisecondToString((fract-num)*week);
	}else if(m>=day){
		var fract = m/day;
		var num = Math.floor(fract);
		return num + " day " + milisecondToString((fract-num)*day);
	}else if(m>=hour){
		var fract = m/hour;
		var num = Math.floor(fract);
		return num + " hour " + milisecondToString((fract-num)*hour);
	}else if(m>=min){
		var fract = m/min;
		var num = Math.floor(fract);
		return num + " min " + milisecondToString((fract-num)*min);
	}else{
		return Math.floor(m/1000) + " second";
	}
}

function localStorageSetGet(key, val) {
	if(typeof val != 'undefined'){
		if(val===null){
			localStorage.removeItem(key);
		}else{
			localStorage.setItem(key, val);
		}
	}

	return localStorage.getItem(key);	
}

function sessionStorageSetGet(key, val) {
	if(typeof val != 'undefined'){
		if(val===null){
			sessionStorage.removeItem(key);
		}else{
			sessionStorage.setItem(key, val);
		}
	}

	return sessionStorage.getItem(key);	
}