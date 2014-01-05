/*
 * Base class for everything
 */
var Class = {
	_init : function(args) {},

	create : function() {
		var o = Object.create(this);
		o._init(arguments);
		return o;
	},

	extend : function(n) {
		var d = Object.create(this);
		for(var k in n) d[k] = n[k];
		var self = this;
		d._init = function(args) {
			self._init.call(this, args);
			if(n.init)
				n.init.apply(this, args);
		};
		return d;
	}
};
