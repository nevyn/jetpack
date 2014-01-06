Spring = Thing.extend({
	Speed : 1,
	Direction : { Vertical : 0, Horizontal : 1 },

	init : function() {
		this.vert = Vector.create(0, Spring.Speed);
		this.hor = Vector.create(Spring.Speed, 0);

		this.direction = Spring.Direction.Vertical;
	},

	update : function() {
		var res = game.moveLinear(this.position, this.direction == Spring.Direction.Vertical ? this.vert : this.hor, this.size);
		this.position = res.position;

		if(res.collision) {
			if(this.direction == Spring.Direction.Vertical)
				this.vert.y = -this.vert.y;
			else
				this.hor.x = -this.hor.x;
		}
	},

	changeDirection : function(direction) {
		this.direction = direction;
	}
});

Rocket = Thing.extend({
	Speed : 1.5,

	init : function() {
		this.velocity.y = -Rocket.Speed;
	},

	update : function() {
		var res = game.moveLinear(this.position, this.velocity, this.size);
		this.position = res.position;

		if(res.collision) {
			// Turn right
			if(this.velocity.y < 0) { this.velocity.y = 0; this.velocity.x = Rocket.Speed; }
			else if(this.velocity.x > 0) { this.velocity.x = 0; this.velocity.y = Rocket.Speed; }
			else if(this.velocity.y > 0) { this.velocity.y = 0; this.velocity.x = -Rocket.Speed; }
			else if(this.velocity.x < 0) { this.velocity.x = 0; this.velocity.y = -Rocket.Speed; }
		}
	}
});

Wallhugger = Thing.extend({
	Speed : 1,
	Direction : { CW : 0, CCW : 1 },
	WallDirection : { Up : 0, Right : 1, Down : 2, Left : 3 },

	init : function() {
		this.hugging = false;
		this.walldirection = Wallhugger.WallDirection.Down;
		this.direction = Wallhugger.Direction.CW;

		// See if there's a wall adjacent
	},

	update : function() {
		// Rescan surrounding to figure out what to do.
		// Move the monster, then check if we went past our goal
		// If we did, check if we should change direction
		// If not, just break here
		// If, find out new direction

		// If no wall, fall down
		var res;
		if(this.hugging) {
			if(this.walldirection == Wallhugger.WallDirection.Down) {
				if(this.direction == Wallhugger.Direction.CW) {
					// Check down
					res = game.moveLinear(this.position, Vector.create(0, 0.5), this.size);
					if(!res.collisionY) {
						// Need to reevaluate
						this.walldirection = Wallhugger.WallDirection.Left;

						this.hugging = false;
					} else if(!res.collision) {
						// We're still on ground, move forward
						res = game.moveLinear(this.position, Vector.create(Wallhugger.Speed, 0), this.size);
						this.position = res.position;
					}
				}
			} else if(this.walldirection == Wallhugger.WallDirection.Left) {
				// Check left
				res = game.moveLinear(this.position, Vector.create(-0.5, 0), this.size);
				if(!res.collisionY) {
					// Need to reevaluate
					this.walldirection = Wallhugger.WallDirection.Up;

					this.hugging = false;
				} else if(!res.collision) {
					// We're still on ground, move forward
					res = game.moveLinear(this.position, Vector.create(0, Wallhugger.Speed), this.size);
					this.position = res.position;
				}				
			}
		} 

		if(!this.hugging) {
			if(this.velocity.y < 2)
				this.velocity.y += 1 * delta;

			res = game.moveLinear(this.position, this.velocity, this.size);
			this.position = res.position;

			if(res.collisionY) {
				// We landed
				this.hugging = true;
				this.walldirection = Wallhugger.WallDirection.Down;
				this.velocity.x = Wallhugger.Speed;
				this.velocity.y = 0;
			}
		}
	}
});

