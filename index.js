if(typeof ejecta != "undefined") {
    ejecta.include('class.js');
    ejecta.include('thing.js');
    ejecta.include('dude.js');
    ejecta.include('monsters.js');
    ejecta.include('world.js');
}

var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");

var mapw = 10;
var maph = 10;

var tilew = 32;
var tileh = 32;

var delta = 60 / 1000;


var drawTile = function(x, y) {
	var t = game.getCollisionTile(x, y);
	if(t == game.CollisionTileTypes.Solid) {
		if(rockTexture.loaded) {
			context.drawImage(rockTexture.image, x * tilew, y * tileh, tilew, tileh);
		}
	} else if(t == game.CollisionTileTypes.Ladder) {
		if(ladderTexture.loaded) {
			context.drawImage(ladderTexture.image, x * tilew, y * tileh, tilew, tileh);
		}
	} else {
		context.fillStyle = '#fff';
		context.fillRect(x * tilew, y * tileh, tilew, tileh);
	}
}

Texture = Class.extend({
	init : function(image) {
		this.loaded = false;
		this.image = new Image();

		var s = this;
		this.image.onload = function() { s.loaded = true; }
		this.image.src = image;
	}
});


var ladderTexture = Texture.create('ladder.png');
var rockTexture = Texture.create('rock.png');
var springTexture = Texture.create('spring.png');


var game = {
	CollisionTileTypes : {
		Empty : 0,
		Solid : 1,
		Ladder : 2,
		LadderUp : 3,
		LadderDown : 4
	},

	OverlayTileTypes : {
		Empty : 0,
		ConveyorLeft : 1,
		ConveyorRight : 2
	},

	dude : null,
	monsters : [],
	buttons : [],

	collisionMap : [
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 1, 1,  1, 1, 2, 0, 0,

		0, 0, 0, 0, 2,  0, 0, 2, 0, 0,
		0, 0, 0, 0, 2,  2, 2, 2, 0, 0,
		0, 0, 2, 0, 2,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 2,  1, 1, 0, 0, 0,
		0, 0, 1, 1, 1,  1, 1, 1, 0, 0
	],

	overlayMap : [
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,

		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,  0, 0, 0, 0, 0
	],

	getCollisionTile : function(x, y) {
		if(x < 0 || x >= mapw || y < 0 || y >= maph) return this.CollisionTileTypes.Solid;
		return this.collisionMap[y * mapw + x];
	},

	getOverlayTile : function(x, y) {
		if(x < 0 || x >= mapw || y < 0 || y >= maph) return this.OverlayTileTypes.Empty;
		return this.overlayMap[y * mapw + x];
	},

	/*
	|--------------------------------------------------------------------------
	| Logic
	|--------------------------------------------------------------------------
	*/

	start : function() {
		/*
		use requestAnimationFrame in the future
		*/
		setInterval(function() { game.update() }, 1000 / 60);
	},

	update : function() {
		this.dude.update(delta);

		for(var i=0; i < this.monsters.length; i++)
			this.monsters[i].update(delta);

		for(var i=0; i < this.buttons.length; i++) {
			if(collide(this.dude, this.buttons[i])) {
				this.buttons[i].startTouch(this.dude);
			} else if(this.buttons[i].isTouching(this.dude)) {
				this.buttons[i].endTouch(this.dude);
			}
		}

		this.render();
	},

	/*
	|--------------------------------------------------------------------------
	| Physics
	|--------------------------------------------------------------------------
	*/

	// Move a bbox through the world
	// Todo: more information about collision?
	// Maybe type of tile in biggest contact area
	moveLinear : function(position, movement, size) {
		var gx = position.x + movement.x * delta;
		var gy = position.y;

		var c = false, cx = false, cy = false;

		var ctt = this.CollisionTileTypes.Empty, ott = this.OverlayTileTypes.Empty;
		var cttArea = 0, ottArea = 0;

		if(movement.x < 0) {
			var ex = Math.floor(gx);
			var y = Math.floor(gy);
			var y2 = Math.floor(gy + size.y - 0.1);

			var col1 = this.getCollisionTile(ex, y);
			var col2 = this.getCollisionTile(ex, y2);

			var ovr1 = this.getOverlayTile(ex, y);
			var ovr2 = this.getOverlayTile(ex, y2);

			if(col1 == 1 || col2 == 1) {
				c = cx = true;
				gx = ex + 1;

				var d = Math.ceil(gy) - y;
				var d2 = gy + size.y - y2;

				if(d >= d2) { ott = ovr1; }
				else if(d2 > d) { ott = ovr2; }

				ctt = 1;
			}
		} else if(movement.x > 0) {
			var ex = Math.floor(gx + size.x);
			var y = Math.floor(gy);
			var y2 = Math.floor(gy + size.y - 0.1);

			var col1 = this.getCollisionTile(ex, y);
			var col2 = this.getCollisionTile(ex, y2);

			var ovr1 = this.getOverlayTile(ex, y);
			var ovr2 = this.getOverlayTile(ex, y2);

			if(col1 == 1 || col2 == 1) {
				c = cx = true;
				gx = ex - size.x;

				var d = Math.ceil(gy) - y;
				var d2 = gy + size.y - y2;

				if(d >= d2) { ott = ovr1; }
				else if(d2 > d) { ott = ovr2; }

				ctt = 1;
			}
		}

		var gy = position.y + movement.y * delta;

		if(movement.y < 0) {
			var ey = Math.floor(gy);
			var x = Math.floor(gx);
			var x2 = Math.floor(gx + size.x - 0.1);

			var col1 = this.getCollisionTile(x, ey);
			var col2 = this.getCollisionTile(x2, ey);

			var ovr1 = this.getOverlayTile(x, ey);
			var ovr2 = this.getOverlayTile(x2, ey);

			if(col1 == 1 || col2 == 1) {
				c = cy = true;
				gy = ey + 1;

				var d = Math.ceil(gx) - gx;
				var d2 = gx + size.x - x2;

				if(d >= d2) { ott = ovr1; }
				else if(d2 > d) { ott = ovr2; }

				if(ott == 0) ott = Math.max(ovr1, ovr2);

				ctt = 1;
			}
		} else if(movement.y > 0) {
			// Check if (middle) bottom is inside block
			var ey = Math.floor(gy + size.y);
			var x = Math.floor(gx);
			var x2 = Math.floor(gx + size.x - 0.1);

			var col1 = this.getCollisionTile(x, ey);
			var col2 = this.getCollisionTile(x2, ey);

			var ovr1 = this.getOverlayTile(x, ey);
			var ovr2 = this.getOverlayTile(x2, ey);

			if(col1 == 1 || col2 == 1) {
				c = cy = true;
				gy = ey - size.y;

				var d = Math.ceil(gx) - gx;
				var d2 = gx + size.x - x2;

				if(d >= d2) { ott = ovr1; }
				else if(d2 > d) { ott = ovr2; }

				if(ott == 0) ott = Math.max(ovr1, ovr2);

				ctt = 1;
			}
		}

		return {
			collision : c,
			collisionX : cx,
			collisionY : cy,
			position : Vector.create(gx, gy),
			collisionTileType : ctt,
			overlayTileType : ott
		};
	},

	collide : function(a, b) {
		if(a.position.x > b.position.x + b.size.x) return false;
		if(a.position.y > b.position.y + b.size.y) return false;
		if(a.position.x + a.size.x < b.position.x) return false;
		if(a.position.y + a.size.y < b.position.y) return false;
		return true;
	},

	/*
	|--------------------------------------------------------------------------
	| Graphics
	|--------------------------------------------------------------------------
	*/

	render : function() {
		context.clearRect(0,0, 640, 480);
		context.fillStyle = '#fff';
		
		for(var y=0; y<mapw; y++) {
			for(var x=0; x<maph; x++) {
				if(this.collisionMap[y * mapw + x] > 0)
					drawTile(x,y);
			}
		}

		context.fillStyle = '#00f';
		context.fillRect(this.dude.position.x * tilew, this.dude.position.y * tileh, this.dude.size.x * tilew, this.dude.size.y * tileh);

		context.fillStyle = '#f00';
		for(var i=0; i < this.monsters.length; i++) {
			var m = this.monsters[i];
			if(springTexture.loaded) {
				context.drawImage(springTexture.image, m.position.x * tilew, m.position.y * tileh, m.size.x * tilew, m.size.y * tileh);
			}
			//context.fillRect(m.position.x * tilew, m.position.y * tileh, m.size.x * tilew, m.size.y * tileh);
		}

		context.fillStyle = '#0f0';
		for(var i=0; i < this.buttons.length; i++) {
			var b = this.buttons[i];
			context.fillRect(b.position.x * tilew, b.position.y * tileh, 0.25 * tilew, 0.25 * tileh);
		}
	}
};

game.dude = Dude.create();

var spring = Spring.create();
spring.position.x = 6;
spring.position.y = 5;

game.monsters.push(spring);

/*spring = Spring.create();
spring.position.x = 2;
spring.position.y = 3;
spring.direction = Spring.Direction.Horizontal;

game.monsters.push(spring);

rocket = Rocket.create();
rocket.position.x = 3;
rocket.position.y = 7;
rocket.size.x = 1;

game.monsters.push(rocket);

/*wh = Wallhugger.create();
wh.position.x = 2;
wh.position.y = 0;

game.monsters.push(wh);*/




/*button = Button.create();
button.position.x = 4;
button.position.y = 8;

game.buttons.push(button);

button.addOutput('activated', spring, 'changeDirection', [ Spring.Direction.Vertical ]);
*/



// Prevent key repeats
var pressing = {
	32 : false,
	37 : false,
	38 : false,
	39 : false,
	40 : false
};


if(typeof $ != "undefined") $(canvas).on('keydown', function(e) {
	if(e.keyCode == 32 && !pressing['32']) { // Space
		pressing['32'] = true;
		game.dude.startJump();
	} else if(e.keyCode == 37 && !pressing['37']) { // Left
		pressing['37'] = true;
		game.dude.moveLeft();
	} else if(e.keyCode == 39 && !pressing['39']) { // Right
		pressing['39'] = true;
		game.dude.moveRight();
	} else if(e.keyCode == 38 && !pressing['38']) { // Up
		pressing['38'] = true;
		game.dude.moveUp();
	} else if(e.keyCode == 40 && !pressing['40']) { // Down
		pressing['40'] = true;
		game.dude.moveDown();
	}
}).on('keyup', function(e) {
	if(e.keyCode == 32) {
		pressing['32'] = false;
		game.dude.stopJump();
	} else if(e.keyCode == 37) { // Left
		pressing['37'] = false;
		game.dude.stopLeft();
	} else if(e.keyCode == 39) { // Right
		pressing['39'] = false;
		game.dude.stopRight();
	} else if(e.keyCode == 38) { // Up
		pressing['38'] = false;
		game.dude.stopUp();
	} else if(e.keyCode == 40) { // Down
		pressing['40'] = false;
		game.dude.stopDown();
	}
});

game.start();
