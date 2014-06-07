'use strict';

function CollapseSlice(type, y, options) {
    WallSlice.call(this, type, y, options);
    
    this.collapseObject = options.collapseObject;
    
    this.collapsePhysics = this.collapseObject.physics;

    this.collapseObject.physicsLock = true;
    this.haveLock = false;

    this.go = false;
}

CollapseSlice.constructor = CollapseSlice;
CollapseSlice.prototype = Object.create(WallSlice.prototype);

CollapseSlice.prototype.updateDisplay = function(offset, index, y) {
    WallSlice.prototype.updateDisplay.call(this, offset, index, y);

    this.haveLock = this.haveLock || this.collapseObject.physicsLock;
    
    if (this.haveLock) {
        this.collapseObject.physicsLock = false;

        if (this.collapseObject.startCollapsing) {
            this.collapsePhysics.update();
        }

    }
    
    this.sprite.position.y += this.collapsePhysics.position.y;
};

CollapseSlice.prototype.initDisplay = function(offset, index, y) {
    WallSlice.prototype.initDisplay.call(this, offset, index, y);

    
};

CollapseSlice.prototype.removeDisplay = function() {
    WallSlice.prototype.removeDisplay.call(this);

    this.collapseObject.physicsLock = this.collapseObject.physicsLock || this.haveLock;
};


CollapseSlice.prototype.checkCollision = function(player, shards) {

    if (!this.collapseObject.startCollapsing) {
        var xdist = player.position.x - this.sprite.position.x;
        if (xdist > -WallSlice.WIDTH) {
            this.collapseObject.startCollapsing = true;
            
            GameGlobal.SoundPlayer.sound.play('crumble');
            GameGlobal.ScreenQuake.startWithIntensity(0.01, 3);
        }
    }
    
    if (player.position.y >= this.sprite.position.y - player.height) {
        var xdist = player.position.x - this.sprite.position.x;
        if (xdist > 0 && xdist < this.width) {
            player.hitBottom(this.sprite.position.y + Math.ceil(this.collapsePhysics.deltaPos.y) - player.height);
        }
    }


    if (shards && shards.animationTime > 0) {
        shards.shards.forEach(function(shard) {
            if (shard.sprite.position.y >= this.sprite.position.y - shard.sprite.height / 10) {
                var xdist = shard.sprite.position.x - this.sprite.position.x;
                if (xdist > 0 && xdist < this.width) {
                    shard.hitBottom(this.sprite.position.y - shard.sprite.height / 10);
                }
            }
        }, this);
    }
};

function GibSlice(type, y, options) {
    CollapseSlice.call(this, type, y, options);

    this.appearTime = Util.random(20, 10);
    this.animationTime = Util.random(70, 20);

    this.objectPhysics = new ObjectPhysics({
        velocity: { x: -200 + Math.random() * 400, y: -120 + Math.random() * 120 },
        acceleration: { x: 0, y: 400 },
        angularVelocity: -2 + Math.random()*4
    });
}

GibSlice.constructor = GibSlice;
GibSlice.prototype = Object.create(CollapseSlice.prototype);

GibSlice.prototype.initDisplay = function(offset, index, y) {
    CollapseSlice.prototype.initDisplay.call(this, offset, index, y);
    
    this.sprite.anchor = { x: 0.5, y: 0.5 };
    this.sprite.alpha = 0;
};

GibSlice.prototype.updateDisplay = function(offset, index, y) {
    CollapseSlice.prototype.updateDisplay.call(this, offset, index, y);

    this.sprite.position.x += this.objectPhysics.position.x;
    this.sprite.position.y += this.objectPhysics.position.y;
    
    this.sprite.rotation = this.objectPhysics.rotation;

    if (--this.appearTime < 0) {
        this.objectPhysics.update();
        this.sprite.alpha = 1;
        if (--this.animationTime < 0) {
            this.sprite.alpha = 0;
        }
    }
};


GibSlice.prototype.checkCollision = function() {

};
