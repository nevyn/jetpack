var Thing = Class.extend({
	init : function() {
		this.position = Vector.create(0,0);
		this.velocity = Vector.create(0,0);

		this.size = Vector.create(0.8, 1);
	},

	update : function() {}
});