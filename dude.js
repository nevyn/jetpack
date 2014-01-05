var Dude = Thing.extend({
	JumpType : { Still : 0, Running : 1 },

	RunSpeed : 1,
	RunJumpSpeed : 1.2,
	StillJumpSpeed : 0.3,
	JumpForce : 1.5,

	init : function() {
		this.direction = -1;

		this.onGround = false;
		this.movingLeft = false;
		this.movingRight = false;
		this.jumping = false;	// True when player presses jump button
		this.jumpType = Dude.JumpType.Still;
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
		
		if(this.onGround)
			this.jump();
	},

	stopJump : function() {
		// Now we can press jump again!
		this.jumping = false;
	},

	jump : function() {
		this.velocity.y = -Dude.JumpForce;

		if(this.velocity.x !== 0)
			this.jumpType = Dude.JumpType.Running;
		else
			this.jumpType = Dude.JumpType.Still;

		this.onGround = false;
	},

	update : function() {
		var moving = this.movingLeft || this.movingRight;

		if(this.onGround) {
			if(moving) {
				this.velocity.x = this.direction * Dude.RunSpeed;
			} else {
				this.velocity.x = 0;
			}

			// Check for hole
			var res = moveLinear(this.position, Vector.create(0, 0.5), this.size);
			if(!res.collision) {
				this.onGround = false;
				this.jumpType = moving ? Dude.JumpType.Running : Dude.JumpType.Still;
			}
		}

		if(!this.onGround) {
			if(moving) {
				if(this.jumpType == Dude.JumpType.Still)
					this.velocity.x = this.direction * Dude.StillJumpSpeed;
				else
					this.velocity.x = this.direction * Math.abs(this.velocity.x);
			}

			if(this.velocity.y < 2)
				this.velocity.y += 1 * delta;
		}

		var res = moveLinear(this.position, this.velocity, this.size);
		this.position = res.position;

		if(res.collisionY) {
			if(this.velocity.y > 0) {
				// We landed
				this.onGround = true;
			}
			this.velocity.y = 0;
		}
	}
});
