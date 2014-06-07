'use strict';

function BombSlice(y, player, gibs) {
    this.type = SliceType.BOMB;

    this.p = player;
    this.e = gibs;

    this.myY = y - 50;

    this.objectPhysics = new ObjectPhysics({
        position: { x: 0, y: -80 },
        velocity: { x: 0, y: 1200 },
    });

    this.sprite = null;
    this.container = new PIXI.DisplayObjectContainer();
}


BombSlice.prototype.initDisplay = function(offset, index) {
    var x = offset + (index * WallSlice.WIDTH) - GameGlobal.ScreenFocus.scroll.x;
    this.objectPhysics.position.x = x;

    var sprite = GameGlobal.PoolKeeper.borrowWallSprite(SliceType.BOMB);
    
    this.scrollSprite = new ScrollSprite(sprite, this.objectPhysics);

    this.container.addChild(this.scrollSprite.sprite);

    this.en = [];
    for (var i = 0; i<6; i++) {
        var sliceType = SliceType.GIBS + Util.random(5);
        var g = new ScrollSprite(GameGlobal.PoolKeeper.borrowWallSprite(sliceType));
        g.type = sliceType;
        this.en.push(g);
        this.container.addChild(g.sprite);
    }
    
    this.sprite = this.container;
};

BombSlice.prototype.removeDisplay = function() {
    
    this.container.removeChild(this.scrollSprite.sprite);
    GameGlobal.PoolKeeper.returnWallSprite(this.type, this.scrollSprite.sprite);

    for (var i = 0; i<6; i++) {
        this.container.removeChild(this.en[i].sprite);
        GameGlobal.PoolKeeper.returnWallSprite(this.en[i].type, this.en[i].sprite);
    }
    
    this.sprite = null;
};

BombSlice.prototype.updateDisplay = function() {
    if (this.p.objectPhysics.position.x > this.objectPhysics.position.x-480) {
        if (this.objectPhysics.position.y <= -64) {
            GameGlobal.SoundPlayer.sound.play('bomb_pre');
        }
        
        this.scrollSprite.update();
        this.scrollSprite.render();

        for (var i = 0; i<6; i++) {
            this.en[i].update();
            this.en[i].render();
        }
    }
    if (this.objectPhysics.velocity.y > 0) {
        if (this.scrollSprite.sprite.position.y > 0) {
            if (this.objectPhysics.position.y > this.myY) {
                this.objectPhysics.velocity.y = 0;
                this.objectPhysics.position.y = this.myY;
                this.objectPhysics.angularVelocity = Math.random() * 0.3 - 0.16;
                //gibs
                this.e.position.x = this.objectPhysics.position.x;
                this.e.position.y = this.objectPhysics.position.y + 50 - 16;
                this.e.start();
                //quake
                GameGlobal.ScreenQuake.startWithIntensity(0.1, 0.15);
                //static gibs
                for (var j = 0; j < 6; j++) {
                    var gib = this.en[j];
                    
                    gib.physics.position.x = this.objectPhysics.position.x - 8 + j * 8;
                    gib.physics.position.y = this.myY + 50 - 16 + Math.random() * 8;
                }
                //sound
                GameGlobal.SoundPlayer.sound.play('bomb_hit');
            }
        }
    }
};


BombSlice.prototype.checkCollision = function() { };


function BombTriggerSlice() {
    this.type = SliceType.GAP;
    this.sprite = undefined;
}

BombTriggerSlice.prototype.updateDisplay = function() {
    GameGlobal.SoundPlayer.sound.play('bomb_launch');
    this.sprite = null;
};

BombTriggerSlice.prototype.checkCollision = function() { };
