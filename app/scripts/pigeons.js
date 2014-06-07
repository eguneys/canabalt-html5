'use strict';

function PigeonGroup(y) {
    this.y = y;
    this.amount = Util.random(10, 2);

    this.container = new PIXI.DisplayObjectContainer();
    
    this.sprite = null;

    this.pigeons = [];

    this.flyOffTimer = Util.random(10);
    
    for (var i = 0; i < this.amount; i++) {
        this.pigeons.push(new Pigeon(this.y));
    }
}

PigeonGroup.prototype.initDisplay = function(offset, index, y) {
    this.x = offset + (index * WallSlice.WIDTH);
    
    for (var i = 0; i < this.amount; i++) {
        this.pigeons[i].initDisplay(this.x);

        this.container.addChild(this.pigeons[i].sprite);
    }

    this.sprite = this.container;

    this.sprite.y = y;
};

PigeonGroup.prototype.updateDisplay = function(offset, index, y) {
    this.x = offset + (index * WallSlice.WIDTH);
    
    for (var i = 0; i < this.amount; i++) {
        this.pigeons[i].updateDisplay(this.x);
    }

    this.sprite.y = y;
};

PigeonGroup.prototype.removeDisplay = function() {
    for (var i = 0; i < this.amount; i++) {
        this.container.removeChild(this.pigeons[i].sprite);
        this.pigeons[i].removeDisplay();
    }

    this.sprite = null;
};

PigeonGroup.prototype.flyOff = function() {
    for (var i = 0; i < this.amount; i++) {
        this.pigeons[i].trigger = true;
    }
    
    if (!!this.nextPigeons && this.flyOffTimer-- < 0) {
        this.nextPigeons.flyOff();
    }
};

PigeonGroup.prototype.checkCollision = function(player) {
    if (this.x - (player.position.x) < PigeonGroup.WIDTH ) {
        this.flyOff();
    }
};

PigeonGroup.WIDTH = WallSlice.WIDTH * 5;

function Pigeon(y) {
    this.type = SliceType.PIGEON;

    this.flaps = ['flap1', 'flap2', 'flap3', ''];

    this.sprite = null;

    this.objectPhysics = new ObjectPhysics({
        position: { x: Util.random(PigeonGroup.WIDTH), y: y },
        velocity: { x: 0, y: -50 - Util.random(50) },
        acceleration: { x: Util.random(200), y: -50 - Util.random(300) },
    });

    this.flipped = Math.random() < 0.5;

    if (!this.flipped) {
        this.objectPhysics.acceleration.x *= -1;
    }
}

Pigeon.prototype.initDisplay = function(x) {
    this.sprite = GameGlobal.PoolKeeper.borrowMovieSprite(this.type);

    this.sprite.scale.x = Pigeon.SCALE;
    this.sprite.scale.y = Pigeon.SCALE;

    if (this.flipped) {
        this.sprite.anchor.x = 1;
        this.sprite.scale.x *= -1;
    }

    this.sprite.gotoAndStop(3);

    this.sprite.position.x = x + this.objectPhysics.position.x;
    this.sprite.position.y = this.objectPhysics.position.y;

    this.trigger = false;
    this.randomFlyOff = Util.random(10);
};

Pigeon.prototype.updateDisplay = function(x) {

    if (this.trigger && this.randomFlyOff-- < 0) {
        if (!this.sprite.playing) {
            this.sprite.animationSpeed = 0.4;
            this.sprite.gotoAndPlay(0);

            if (Math.random() < 0.5) {
                GameGlobal.SoundPlayer.sound.play(this.flaps[Util.random(this.flaps.length - 1)]);
            }
        }
        this.objectPhysics.update();
    }

    this.sprite.position.x = x + this.objectPhysics.position.x;
    this.sprite.position.y = this.objectPhysics.position.y;
};

Pigeon.prototype.removeDisplay = function() {
    this.sprite.gotoAndStop(0);
    GameGlobal.PoolKeeper.returnMovieSprite(this.type, this.sprite);
    this.sprite = null;
};

Pigeon.SCALE = 1;

Pigeon.HEIGHT = 10 * Pigeon.SCALE;
Pigeon.WIDTH = 10 * Pigeon.SCALE;
