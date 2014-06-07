'use strict';

function Shard(type) {
    this.type = SliceType.GLASS + type;

    this.sprite = GameGlobal.PoolKeeper.borrowWallSprite(this.type);

    this.sprite.scale.x = WallSlice.SCALE;
    this.sprite.scale.y = WallSlice.SCALE;

    this.sprite.anchor = { x: 0.5, y: 0.5 };

    this.t = 1 + Util.random(6);

    this.shardSounds = ['glass1', 'glass2', ''];
}

Shard.prototype.init = function(x, y, velocity) {

    this.objectPhysics = new ObjectPhysics({
        position: { x: x, y: y },
        velocity: { x: velocity.x / 2, y: velocity.y / 2 - Math.random() * 40 },
        acceleration: { x: 0, y: 500 },
        angularVelocity: -0.25 + (Math.random() * 0.5)
    });

    this.objectPhysics.velocity.x += Math.random() * this.objectPhysics.velocity.x*2;
    this.objectPhysics.velocity.y += Math.random() * this.objectPhysics.velocity.y*2;

};

Shard.prototype.update = function(viewportX, viewportY) {
    
    this.objectPhysics.update();
    
    this.sprite.position.x = this.objectPhysics.position.x - viewportX;
    this.sprite.position.y = this.objectPhysics.position.y + viewportY;
    
    this.sprite.rotation = this.objectPhysics.rotation;
};


Shard.prototype.hitBottom = function(y) {
    if (this.t > 5 && this.objectPhysics.velocity.y > 120) {
        GameGlobal.SoundPlayer.sound.play(this.shardSounds[this.t%2]);
    }
    
    
    this.objectPhysics.position.y = y - GameGlobal.ScreenFocus.scroll.y;
    
    this.objectPhysics.velocity.x *= 0.5 + Math.random() * 0.6;
    this.objectPhysics.velocity.y *= -0.2 -Math.random() * 0.3;
    var vy = this.objectPhysics.velocity.y *3;
    this.objectPhysics.angularVelocity = (Math.random()*vy-vy*2)/16;
};

Shard.prototype.hitUp = function(y) {
    //this.sprite.position.y = y;
    this.objectPhysics.position.y = y - GameGlobal.ScreenFocus.scroll.y;
    this.objectPhysics.velocity.y = 0;
};


function ShardsAsset() {
    PIXI.DisplayObjectContainer.call(this);

    this.shards = [];

    this.shattered = 0;
    this.animationTime = 500;
    
    this.setViewportX = function(newViewportX, newViewportY) {
        this.viewportX = newViewportX;
        this.viewportY = newViewportY;
        this.update();
    };

    this.addShards();
    this.initShards(0, 0, {x:0, y:0});
}

ShardsAsset.constructor = ShardsAsset;
ShardsAsset.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

ShardsAsset.prototype.shatter = function(x, y, velocity) {
    if (Math.random() < 0.5) {
        GameGlobal.SoundPlayer.sound.play('window1');
    } else {
        GameGlobal.SoundPlayer.sound.play('window2');
    }
    
    this.shattered = this.animationTime;
    this.initShards(x, y, velocity);
};

ShardsAsset.prototype.update = function() {
    if (--this.shattered > 0) {
        this.updateShards();
    }
};

ShardsAsset.prototype.addShards = function() {
    for (var i = 0; i<50; i++) {
        this.shards.push(new Shard(Util.random(47)));
        this.addChild(this.shards[i].sprite);
    }
};

ShardsAsset.prototype.initShards = function(x, y, velocity) {
    x = x + this.viewportX;
    y = y - this.viewportY;
    
    for (var i = 0; i < this.shards.length; i++) {
        this.shards[i].init(x, y + (i * GlassWindow.HEIGHT / 2), { x: velocity.x, y: velocity.y });
    }
};

ShardsAsset.prototype.updateShards = function() {
    for (var i = 0; i < this.shards.length; i++) {
        this.shards[i].update(this.viewportX, this.viewportY);
    }
};


function GlassWindow(y, offsetX, shardAsset) {
    this.type = SliceType.GLASSWINDOW;
    GraphicSlice.call(this, y, offsetX, this.type);

    this.shardAsset = shardAsset;
}

GlassWindow.constructor = GlassWindow;
GlassWindow.prototype = Object.create(GraphicSlice.prototype);

GlassWindow.prototype.checkCollision = function(player) {
    if (this.sprite.alpha !== 0 && this.sprite.position.x - player.position.x < player.width) {
        this.sprite.alpha = 0;
        if (this.shardAsset !== null) {
            this.shardAsset.shatter(this.sprite.position.x, this.sprite.position.y, { x: player.objectPhysics.velocity.x, y: player.objectPhysics.velocity.y });
        }
    }
};

GlassWindow.HEIGHT = 4 * WallSlice.SCALE;
GlassWindow.WIDTH = 4 * WallSlice.SCALE;


function Hall3Slice(y, hallUp) {
    this.type = SliceType.HALL3;
    GraphicSlice.call(this, y, WallSlice.WIDTH / 2, this.type);

    this.hallUp = hallUp || false;
}

Hall3Slice.constructor = Hall3Slice;
Hall3Slice.prototype = Object.create(GraphicSlice.prototype);

Hall3Slice.prototype.checkCollision = function(player, shards) {
    var hitHallUp = this.hallUp;
    if (hitHallUp) {
        if (player.position.y <= this.sprite.position.y) {
            var xdist = player.position.x - this.sprite.position.x;
            if (xdist > 0 && xdist < WallSlice.WIDTH) {
                player.hitUp(this.sprite.position.y);
            }
        }
        
        if (shards && shards.animationTime > 0) {
            shards.shards.forEach(function(shard) {
                if (shard.sprite.position.y <= this.sprite.position.y) {
                    xdist = shard.sprite.position.x - this.sprite.position.x;
                    if (xdist > 0 && xdist < WallSlice.WIDTH) {
                        shard.hitUp(this.sprite.position.y);
                    }
                }
            }, this);
        }
    }
};

function GraphicSlice(y, offsetX, type) {
    this.type = type;
    this.y = y;
    this.offsetX = offsetX;
    
    this.sprite = null;
}

GraphicSlice.prototype.initDisplay = function(offset, index, y) {
    var x = offset + (index * WallSlice.WIDTH);
    
    this.sprite = GameGlobal.PoolKeeper.borrowGraphic(this.type);

    this.sprite.alpha = 1;

    this.sprite.position.x = x + this.offsetX;
    this.sprite.position.y = this.y + y;
};

GraphicSlice.prototype.updateDisplay = function(offset, index, y) {
    var x = offset + (index * WallSlice.WIDTH);

    this.sprite.position.x = x + this.offsetX;
    this.sprite.position.y = this.y + y;
};

GraphicSlice.prototype.removeDisplay = function() {
    GameGlobal.PoolKeeper.returnGraphic(this.type, this.sprite);
    this.sprite = null;
};

GraphicSlice.prototype.checkCollision = function(player) {};
