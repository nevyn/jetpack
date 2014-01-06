var Button = Thing.extend({
	Mode : { Use : 0, Touch : 1 },

	init : function() {
		this.mode = Button.Mode.Touch;
	},

	touchedBy : function(thing) {
		// We don't really care what touched the button
		if(this.mode == Button.Mode.Touch)
			this.invoke('activated');
	},

	usedByPlayer : function() {
		if(this.mode == Button.Mode.Use)
			this.invoke('activated');
	}
});