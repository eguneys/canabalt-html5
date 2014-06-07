'use strict';

function ObstacleSlice(type, y, options) {
    WallSlice.call(this, type, y, options);

    this.stumble = false;

    this.stumblePhysics = new ObjectPhysics({
        velocity: { x: 0, y: -120 },
        acceleration: { x: 0, y: 320 },
        angularVelocity: Math.random() * 2 - 1,
    });
}

ObstacleSlice.constructor = ObstacleSlice;
ObstacleSlice.prototype = Object.create(WallSlice.prototype);

ObstacleSlice.WIDTH = 18 * WallSlice.SCALE;
ObstacleSlice.HEIGHT = 18 * WallSlice.SCALE;

ObstacleSlice.prototype.initDisplay = function(offset, index, y) {
    WallSlice.prototype.initDisplay.call(this, offset, index, y);

    this.sprite.anchor = { x: 0.5, y: 0.5 };
};

ObstacleSlice.prototype.updateDisplay = function(offset, index, y) {
    WallSlice.prototype.updateDisplay.call(this, offset, index, y);

    if (this.stumble) {
        this.stumblePhysics.update();
        this.sprite.rotation = this.stumblePhysics.rotation;

        this.sprite.position.x += this.stumblePhysics.position.x;
        this.sprite.position.y += this.stumblePhysics.position.y;
        
        this.sprite.alpha++;
        this.sprite.alpha %= 2;
    }
};

ObstacleSlice.prototype.checkCollision = function(player) {
    if (player.position.y >= this.sprite.position.y - player.height) {
        var xdist = (player.position.x + player.width) - (this.sprite.position.x);
        if (xdist > 0 && xdist < this.width) {
            if (!this.stumble) {
                player.hitObstacle();
                this.stumble = true;

                var rs = Util.random(3);
                switch(rs) {
                case 0: GameGlobal.SoundPlayer.sound.play('obstacle1'); break;
                case 1: GameGlobal.SoundPlayer.sound.play('obstacle2'); break;
                case 2: GameGlobal.SoundPlayer.sound.play('obstacle3'); break;
                default: break;
                }

                this.stumblePhysics.velocity.y = -120;
                this.stumblePhysics.velocity.x = player.objectPhysics.velocity.x + Util.random(100) - 50;
                
            }

        }
    }
};
