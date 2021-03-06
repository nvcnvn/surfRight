function RuleManager() {
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

RuleManager.prototype.List = function(table) {
	var self = this;

	var fn =function(init){
		if(typeof init == 'string') {
			init = new Rule(init);
		}
		var dmMngr = new SiteManager(self.db, init);
		$(table).find('.rule-list').append(dmMngr.element);

		self.db.rule.query().all().execute().done(function(rules){
			$.each(rules, function(idx, item){
				var dmMngr = new SiteManager(self.db, item);
				$(table).find('.rule-list').append(dmMngr.element);			
			});
		});
	}

	if(window.location.hash.length > 3){
		var hostname = window.location.hash.slice(1);
		self.db.rule
		.get(hostname)
		.done(function(rule) {
			if(typeof rule == 'undefined') {
				self.db.rule
				.query('aliases')
				.only(hostname)
				.execute()
				.done(function(rules){
					if(rules.length == 0) {
						fn(hostname);
					}else{
						fn(0);
					}
				})
				.fail(function(){
					fn(hostname);
				});
			}else{
				fn(0);
			}
		}).fail(function(){
			fn(hostname);
		});
	}else{
		fn(0);
	}
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

function LabelAlias(parent, alias) {
	this.parent = parent;

	this.element = $('<div></div>', {
		class: 'control-group input-prepend input-append block',
		id: alias
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

	if(typeof alias != 'undefined' && (typeof alias == 'string' || alias instanceof String)) {
		self.txtAlias.val(alias);
	}
	self.txtAlias.focus();
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

function LabelInstruction(parent) {
	this.parent = parent;
	this.element = $('<div></div>', {
		class: 'control-group controls-row input-prepend input-append block'
	}).data('data', this);

	this.element.append($('<span class="add-on">In</span>'));

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

	this.element.append($('<span class="add-on">if surf</span>'));

	this.amount = $('<input/>', {
		class: 'input-mini',
		type: 'number',
		min: 1
	});
	this.element.append(this.amount);

	this.element.append($('<span class="add-on">hours, then give</span>'));

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
		self.parent.AddLabelInstruction();
	});

	self.bt.lbl1.click(function(){
		self.element.remove();
	});
}

LabelInstruction.prototype.Val = function() {
	var instruction = new BlockInstruction();
	instruction.level = parseInt(this.sltLevel.val());
	instruction.when = parseInt(this.sltRule.val());
	instruction.amount = 60*parseInt(this.amount.val());

	return instruction;
};

LabelInstruction.prototype.Validate = function() {
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
		data = new Rule();
	}

	this.data = data;
	this.element = $('<tr></tr>', {
		id: this.data.domain
	}).data('data', this.data);

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
			self.AddLabelInstruction(item);
		});
	} else {
		this.AddLabelInstruction();
	}

	this.tdBt = $('<td></td>');
	this.element.append(this.tdBt);

	this.tool = new ButtonGroup(['Save', 'Delete']);
	this.tdBt.append(this.tool.element);

	var self = this;
	this.tool.lbl0.click(function() {
		self.Save();
	});
	self.tool.lbl1.click(function() {
		self.Delete();
	});
}

SiteManager.prototype.Val = function() {
	return this.data;
};

SiteManager.prototype.Delete = function() {
	var self = this;

	self.db.rule.remove(self.data.domain).done(function(){
		self.element.remove();
	}).fail(function(){
		console.log('err');
	});
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

	self.db.rule.update(self.data).done(function(){
		console.log('update done');
	}).fail(function() {
		self.db.rule.add(self.data).done(function(){
			console.log('save done');
		}).fail(function() {
			self.element.addClass('error');
		});	
	});
};

SiteManager.prototype.AddLabelAlias = function(alias) {
	var l = new LabelAlias(this, alias);
	this.tdAliases.append(l.element);
};

SiteManager.prototype.AddLabelInstruction = function(rule) {
	var l = new LabelInstruction(this);
	this.tdRules.append(l.element);
	if(rule instanceof Object) {
		if(typeof rule.level == 'number') {
			l.sltLevel.find('option:eq('+ rule.level +')').prop('selected', true);
		}

		if(typeof rule.when == 'number') {
			l.sltRule.find('option:eq('+ rule.when +')').prop('selected', true);
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
	var manager = new RuleManager();
})