var Dude = Thing.extend({
	RunSpeed : 0.8,

	StillJumpSpeed : 0.3,	// Horizontal
	RunJumpSpeed : 1,		//     "
	JumpForce : 1.5,		// Vertical

	ClimbSpeed : 1,

	// Different states the dude can be in, that affects physics differently
	// Dude can only be in one of these at one time
	// OnGround - Standing on actual solid ground
	// Airborne - In the air
	// Climbing - On a ladder
	State : { OnGround : 0, Airborne : 1, Climbing : 2 },
	JumpType : { Still : 0, Running : 1 },

	init : function() {
		// Which direction is the dude facing? (Left -1 or right 1)
		this.direction = -1;

		// Input states
		// ------------

		this.movingLeft = false;
		this.movingRight = false;
		this.movingUp = false;
		this.movingDown = false;
		this.jumping = false;

		// Logic States
		// ------------

		// Start in free-fall
		this.state = Dude.State.Airborne;

		// How was the jump made? (only applicable for Airborne state)
		this.jumpType = Dude.JumpType.Still;

		this.size.y = 0.8;
	},

	moveLeft : function() {
		this.movingLeft = true;
		this.direction = -1;
	},

	moveRight : function() {
		this.movingRight = true;
		this.direction = 1;
	},

	stopLeft : function() {
		this.movingLeft = false;
		if(this.movingRight)
			this.direction = 1;
	},

	stopRight : function() {
		this.movingRight = false;
		if(this.movingLeft)
			this.direction = -1;
	},

	startJump : function() {
		if(this.jumping) return;
		this.jumping = true;

		if(this.state == Dude.State.OnGround || this.state == Dude.State.Climbing)
			this.jump();
	},

	stopJump : function() {
		// Now we can press jump again!
		this.jumping = false;
	},

	jump : function() {
		this.velocity.y = -Dude.JumpForce;

		if(this.movingLeft || this.movingRight) {
			this.jumpType = Dude.JumpType.Running;
		} else
			this.jumpType = Dude.JumpType.Still;

		this.state = Dude.State.Airborne;
	},

	moveUp : function() {
		this.movingUp = true;
	},

	stopUp : function() {
		this.movingUp = false;
	},

	moveDown : function() {
		this.movingDown = true;

		// If on a ladder, or standing on a ladder
		//if(this.onLadder()) {
		//	this.climbing = true;
		//	this.onGround = false;
		//}
	},

	stopDown : function() {
		this.movingDown = false;
	},


	onLadder : function() {
		// todo: Think we need to offset with half size too...
		return game.getCollisionTile(Math.floor(this.position.x + this.size.x / 2), Math.floor(this.position.y + this.size.y / 2)) == game.CollisionTileTypes.Ladder;
	},

	startClimbing : function() {
		// Center dude on ladder
		this.position.x = Math.floor(this.position.x + this.size.x / 2) + 0.5 - this.size.x / 2;
	},


	update : function() {
		var running = this.movingLeft || this.movingRight;
		var climbing = this.movingUp || this.movingDown;

		// Quasi-FSM
		var res;
		if(this.state == Dude.State.OnGround) {

			// While on ground, no gravity is added
			// Move left or right
			if(running) {
				this.velocity.x = this.direction * Dude.RunSpeed;
			} else {
				this.velocity.x = 0;
			}

			// Add/remove special floors
			res = game.moveLinear(this.position, Vector.create(0, 0.5), this.size);
			if(res.overlayTileType == game.OverlayTileTypes.ConveyorLeft) {
				this.velocity.x -= 0.5;
			} else if(res.overlayTileType == game.OverlayTileTypes.ConveyorRight) {
				this.velocity.x += 0.5;
			}

			// Continously look for holes below feet
			res = game.moveLinear(this.position, Vector.create(0, 0.5), this.size);
			if(!res.collisionY) {
				// ... should probably kill x vel here
				// todo NEEDS MOAR WORK
				this.jumpType = Dude.JumpType.Still;
				this.state = Dude.State.Airborne;
			}

			// We have velocity already?
			res = game.moveLinear(this.position, this.velocity, this.size);
			this.position = res.position;

		} else if(this.state == Dude.State.Airborne) {

			// Add gravity
			if(this.velocity.y < 2)
				this.velocity.y += 1 * delta;

			// Permit air control
			if(running) {
				if(this.jumpType == Dude.JumpType.Still)
					this.velocity.x = this.direction * Dude.StillJumpSpeed;
				else if(this.jumpType == Dude.JumpType.Running)
					this.velocity.x = this.direction * Dude.RunJumpSpeed;
			}

			res = game.moveLinear(this.position, this.velocity, this.size);
			this.position = res.position;

			// Kill x vel if hitting wall
			if(res.collisionX) {
				this.jumpType = Dude.JumpType.Still;
			}

			// Look for ground
			if(res.collisionY) {
				if(this.velocity.y > 0)	// Falling
					this.state = Dude.State.OnGround;
				this.velocity.y = 0;
			}

		} else if(this.state == Dude.State.Climbing) {

		}
	}
});
