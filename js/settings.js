function SettingManager() {
	var self = this;
	OpenDB()
	.done(function(s) {
		self.db = s;
		// load all the things and show
		self.List('#tbSetting');
	})
	.fail(function() {
		alert('Cannot connect to browser IndexedDB');
	});
}

SettingManager.prototype.List = function(table) {
	var self = this;
	var dmMngr = new SiteManager(self.db, 0);
	$(table).find('.setting-list').append(dmMngr.element);

	self.db.setting.query().all().execute().done(function(settings){
		$.each(settings, function(idx, item){
			console.log('item', item)
			var dmMngr = new SiteManager(self.db, item);
			$(table).find('.setting-list').append(dmMngr.element);			
		});
	});
};

function ButtonGroup(labels) {
	this.element = $('<div></div>', {
		class: 'btn-group'
	});

	var btn = $('<button></button>', {
		class: 'btn dropdown-toggle',
		'data-toggle': 'dropdown'
	}).append($('<span></span>', {
		class: 'caret'
	}));
	this.element.append(btn);

	var ul = $('<ul></ul>', {
		class: 'dropdown-menu'
	});

	var self = this;
	$.each(labels, function(idx, item){
		self['lbl'+idx] = $('<a></a>', {
			text: item,
			href: '#'
		});
		ul.append($('<li></li>').append(self['lbl'+idx]));
	});

	this.element.append(ul);
}

function LabelSite(parent) {
	this.parent = parent;

	this.element = $('<div></div>', {
		class: 'control-group input-prepend'
	}).data('data', this);

	this.element.append($('<span class="add-on">http(s)://</span>'));

	this.txtSite = $('<input/>', {
		type: 'text',
		class: 'input-small'
	});
	this.element.append(this.txtSite);

	var self = this;
	self.txtSite.keypress(function(ev){
		self.Validate();
	});
}

LabelSite.prototype.Val = function() {
	return this.txtSite.val();
};

LabelSite.prototype.Validate = function() {
	var self = this;
	if(self.txtSite.val().length < 3) {
		self.element.addClass('error');
		return false;
	} else {
		self.element.removeClass('error');
		return true;
	}
};

function LabelAlias(parent) {
	this.parent = parent;

	this.element = $('<div></div>', {
		class: 'control-group input-prepend input-append block'
	}).data('data', this);

	this.element.append($('<span class="add-on">http(s)://</span>'));

	this.txtAlias = $('<input/>', {
		type: 'text',
		class: 'txtAlias input-medium'
	});
	this.element.append(this.txtAlias);

	this.bt = new ButtonGroup(['Add', 'Delete']);
	this.element.append(this.bt.element);

	var self = this;
	self.txtAlias.keypress(function(ev){
		var ok = self.Validate();
		var keycode = (ev.keyCode ? ev.keyCode : ev.which);
		if(keycode == '13'){
			if(ok) {
				self.parent.AddLabelAlias();
			}
		}
	});

	self.bt.lbl0.click(function(){
		if(self.Validate()) {
			self.parent.AddLabelAlias();
		}
	});

	self.bt.lbl1.click(function(){
		self.element.remove();
	});
}

LabelAlias.prototype.Val = function() {
	return this.txtAlias.val();
};

LabelAlias.prototype.Validate = function() {
	var self = this;
	if(self.txtAlias.val().length < 3) {
		self.element.addClass('error');
		return false;
	} else {
		self.element.removeClass('error');
		return true;
	}	
};

function LabelRule(parent) {
	this.parent = parent;
	this.element = $('<div></div>', {
		class: 'control-group controls-row input-prepend input-append block'
	}).data('data', this);

	//this.element.append($('<span class="add-on">In</span>'));

	this.sltRule = $('<select></select>', {
		class: 'input-small'
	});
	this.sltRule.append($('<option></option>', {
		val: 0,
		text: 'Day'
	}));
	this.sltRule.append($('<option></option>', {
		val: 1,
		text: 'Week'
	}));
	this.sltRule.append($('<option></option>', {
		val: 2,
		text: 'Month'
	}));
	this.element.append(this.sltRule);

	this.element.append($('<span class="add-on"></span>'));

	this.amount = $('<input/>', {
		class: 'input-mini',
		type: 'number',
		min: 1
	});
	this.element.append(this.amount);

	this.element.append($('<span class="add-on"></span>'));

	this.sltLevel = $('<select></select>', {
		class: 'input-small'
	});
	this.sltLevel.append($('<option></option>', {
		val: 0,
		text: 'Info'
	}));
	this.sltLevel.append($('<option></option>', {
		val: 1,
		text: 'Warning'
	}));
	this.sltLevel.append($('<option></option>', {
		val: 2,
		text: 'Block'
	}));
	this.element.append(this.sltLevel);

	this.bt = new ButtonGroup(['Add', 'Delete']);
	this.element.append(this.bt.element);

	var self = this;

	self.bt.lbl0.click(function(){
		self.parent.AddLabelRule();
	});

	self.bt.lbl1.click(function(){
		self.element.remove();
	});
}

LabelRule.prototype.Val = function() {
	var instruction = new BlockInstruction();
	instruction.level = parseInt(this.sltLevel.val());
	instruction.when = parseInt(this.sltRule.val());
	instruction.amount = 60*parseInt(this.amount.val());

	return instruction;
};

LabelRule.prototype.Validate = function() {
	if (parseInt(this.amount.val()) < 1) {
		this.element.addClass('error');
		return false;
	} else {
		this.element.removeClass('error');
		return true;
	}
};

function SiteManager(db, data) {
	var self = this;
	this.db = db;
	if(typeof data.domain == 'undefined' || typeof data.aliases == 'undefined' ||
		typeof data.instructions == 'undefined') {
		data = new Setting();
	}

	this.data = data;
	this.element = $('<tr></tr>').data('data', this.data);

	this.tdSite = $('<td></td>');
	this.element.append(this.tdSite);
	if(typeof data.domain == 'undefined') {
		this.AddLabelSite();
	}else{
		this.AddLabelSite(data.domain);
	}

	this.tdAliases = $('<td></td>');
	this.element.append(this.tdAliases);
	if(data.aliases instanceof Array && data.aliases.length > 0) {
		$.each(data.aliases, function(idx, item) {
			self.AddLabelAlias(item);
		});
	}else{
		this.AddLabelAlias();
	}

	this.tdRules = $('<td></td>');
	this.element.append(this.tdRules);
	if(data.instructions instanceof Array && data.instructions.length > 0) {
		$.each(data.instructions, function(idx, item){
			self.AddLabelRule(item);
		});
	} else {
		this.AddLabelRule();
	}

	this.tdBt = $('<td></td>');
	this.element.append(this.tdBt);

	this.tool = new ButtonGroup(['Save', 'Delete']);
	this.tdBt.append(this.tool.element);

	var self = this;
	this.tool.lbl0.click(function() {
		self.Save();
	});
}

SiteManager.prototype.Val = function() {
	return this.data;
};

SiteManager.prototype.Save = function() {
	var self = this;

	self.data.domain = self.tdSite.find('.control-group').data('data').Val();

	self.data.aliases = [];
	var tdAliases = self.tdAliases.find('.control-group');
	$.each(tdAliases, function(idx, item) {
		self.data.aliases.push($(item).data('data').Val());
	})

	self.data.instructions = [];
	var tdRules = self.tdRules.find('.control-group');
	$.each(tdRules, function(idx, item) {
		self.data.instructions.push($(item).data('data').Val());
	})

	if(typeof self.data.id == 'undefined') {
		self.db.setting.add(self.data).done(function(){
			console.log('save done');
		}).fail(function() {
			self.element.addClass('error');
		});
	}else{
		self.db.setting.update(self.data).done(function(){
			console.log('update done');
		}).fail(function() {
			self.element.addClass('error');
		});
	}
};

SiteManager.prototype.AddLabelAlias = function(alias) {
	var l = new LabelAlias(this);
	this.tdAliases.append(l.element);
	if(typeof alias == 'string' || alias instanceof String) {
		l.txtAlias.val(alias);
	}
	l.txtAlias.focus();
};

SiteManager.prototype.AddLabelRule = function(rule) {
	var l = new LabelRule(this);
	this.tdRules.append(l.element);
	if(rule instanceof Object) {
		if(typeof rule.level == 'number') {
			l.sltLevel.find('option:eq('+ rule.level +')').prop('selected', true);
		}

		if(typeof rule.when == 'number') {
			l.sltRule.find('option:eq('+ rule.level +')').prop('selected', true);
		}

		if(typeof rule.amount == 'number') {
			l.amount.val(rule.amount/60);
		}
	}
	l.amount.focus();
};

SiteManager.prototype.AddLabelSite = function(site) {
	var l = new LabelSite(this);
	this.tdSite.append(l.element);
	if(typeof site == 'string' || site instanceof String) {
		l.txtSite.val(site);
	}
	l.txtSite.focus();
};

//exec
$(function(){
	var manager = new SettingManager();
})