function SettingManager() {
	var self = this;
	OpenDB()
	.done(function(s) {
		self.db = s;
		// load all the things and show

	})
	.fail(function() {
		alert('Cannot connect to browser IndexedDB');
	});
}

SettingManager.prototype.List = function(table) {
	//$(table)
};

SettingManager.prototype.HandleAddNewDomain = function(txtNewDomain, txtNewAliases, btAddNew) {
	var self = this;
	console.log('HandleAddNewDomain');
	$(btAddNew).click(function(){
		var domain = $(txtNewDomain).val();
		var aliases = $(txtNewAliases).val();
		console.log('click')
		self.db.setting.query('domain')
		.filter('domain', domain)
		.execute()
		.done(function(settings){
			console.log('settings', settings)
			if(settings.length == 0) {
				var st = new Setting(domain);
				st.AddAliases(aliases);

				self.db.setting.add(st)
				.done(function(st){
					console.log(st);
				})
				.fail(function(){
					console.log("flaied");
				});
			} else {

			}
		});
	});
};

//exec
$(function(){
	var manager = new SettingManager();
	manager.HandleAddNewDomain("#txtNewDomain", "#txtNewAliases", "#btAddNew");
})