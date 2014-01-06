var Vector = Class.extend({
	init : function(x, y) {
		this.x = x;
		this.y = y;
	},

	vectorFromAddedVector : function(v) {
		return Vector.create(this.x + v.x, this.y + v.y);
	}
});

var Thing = Class.extend({
	init : function() {
		this.position = Vector.create(0,0);
		this.velocity = Vector.create(0,0);

		this.size = Vector.create(0.8, 1);

		this.outputs = {};
		this.touching = [];
	},

	update : function() {},

	startTouch : function(thing) {
		if(!this.isTouching(thing)) {
			this.touching.push(thing);
			this.touchedBy(thing);
		}
	},

	endTouch : function(thing) {
		for(var i=0; i<this.touching.length; i++) {
			if(this.touching[i] === thing) {
				this.touching.splice(i, 1);
				this.leftBy(thing);
				return;
			}
		}
	},

	isTouching : function(thing) {
		for(var i=0; i<this.touching.length; i++) {
			if(this.touching[i] === thing)
				return true;
		}
		return false;
	},

	touchedBy : function(thing) { console.log(this + ' touched by ' + thing); },
	leftBy : function(thing) { console.log(this + ' left by ' + thing); },

	usedByPlayer : function() {},

	addOutput : function(on, target, run, args) {
		if(!(on in this.outputs))
			this.outputs[on] = [];

		this.outputs[on].push({
			target : target,
			run : run,
			"arguments" : args
		});
	},

	getOutputs : function(on) {
		if(on in this.outputs)
			return this.outputs[on];
	},

	invoke : function(on) {
		console.log('Invoke ' + on);
		if(on in this.outputs) {
			for(var i = 0; i < this.outputs[on].length; i++) {
				var o = this.outputs[on][i];
				o.target[o.run].apply(o.target, o['arguments']);
			}
		}
	}
});