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
	var dmMngr = new SiteManager(0);
	$(table).find('.setting-list').append(dmMngr.element);
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

function LabelDomainManagaer(parent) {
	this.parent = parent;

	this.element = $('<div></div>');
	this.element.append($('<div></div>', {
		class: 'txtDomain',
		contenteditable: true
	}));

	this.lblDel = $('<label>X</label>');
	this.element.append(this.lblDel);
	this.HandleDelClick();
}

LabelDomainManagaer.prototype.HandleContaintPress = function() {
	
};

LabelDomainManagaer.prototype.HandleDelClick = function() {
	var self = this;
	self.lblDel.click(function(){
		self.lblDel.remove();
	});
};

function SiteManager(data) {
	if(!(data instanceof Setting)) {

	}

	this.data = data;
	this.element = $('<tr></tr>').data('data', this.data);

	var num = $('<td></td>');
	this.element.append(num);

	var d = new LabelDomainManagaer(this);
	this.element.append(d.element);

	var aliases = $('<td></td>');
	this.element.append(aliases);

	var rules = $('<td></td>');
	this.element.append(rules);

	var del = $('<td></td>');
	this.element.append(del);
}

//exec
$(function(){
	var manager = new SettingManager();
	manager.HandleAddNewDomain("#txtNewDomain", "#txtNewAliases", "#btAddNew");
	manager.List('#tbSetting');
})