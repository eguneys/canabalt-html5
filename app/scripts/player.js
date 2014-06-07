'use strict';

function PlayerAsset() {
    this.buildFrames();
    ScrollMovie.call(this, this.run1Frames);

    this.buildSounds();
    
    this.bindKeyHandlers();

    //this.width = 16 * 1.5;
    //this.height = 18 * 1.5;
    
    this.animationSpeed = 0.5;
    this.gotoAndPlay(0);

    this.onFloor = false;
    this.stumble = false;
    this.jump = 0;

    this.craneFeet = false;
    this.fc = 0;

    this.maxVelocity = { x: 1000, y: 360 };
    this.jumpLimit = 0;
    this.my = 0;

    this.objectPhysics = new ObjectPhysics({
        position: { x: WallSlice.WIDTH * 5 * 2, y: 0 },
        acceleration: { x: 1, y: PlayerAsset.GRAVITY },
        maxVelocity: { x: 1000, y: 360 },
        velocity: { x: 125, y: 0 },
    });

    this.epitaph = "fall";
}

PlayerAsset.prototype.constructor = PlayerAsset;
PlayerAsset.prototype = Object.create(ScrollMovie.prototype);

PlayerAsset.GRAVITY = 1200;

PlayerAsset.prototype.jumpPressed = function() {
    if (this.jump >= 0) {
        if (this.jump === 0) {
            var rs = Util.random(4);
            switch (rs) {
            case 0: GameGlobal.SoundPlayer.sound.play('jump1'); break;
            case 1: GameGlobal.SoundPlayer.sound.play('jump2'); break;
            case 2: GameGlobal.SoundPlayer.sound.play('jump3'); break;
            default: break;
            }
        }
        this.jump+= GameGlobal.TimeKeeper.elapsed * 0.001;

        if (this.jump > this.jumpLimit) {
            this.jump = -1;
        }
    } else {
        this.jump = -1;
    }
};

PlayerAsset.prototype.update = function() {
    if (this.position.y > 484) {
        this.dead = true;
        return;
    }

    this.updatePlayer();
    
    this.objectPhysics.update();
    this.position.x += this.objectPhysics.deltaPos.x;
    this.position.y += this.objectPhysics.deltaPos.y;

    this.render();
};

PlayerAsset.prototype.updatePlayer = function() {
    //walldeath
    if (this.objectPhysics.acceleration.x <= 0) {
        return;
    }

    this.updateJump();
    this.updateSpeed();

    this.updateAnimation();
    this.updateSound();
    
    this.onFloor = false;
    this.stumble = false;
};

PlayerAsset.prototype.render = function() {
    var screenPos = {
        x: this.objectPhysics.position.x + GameGlobal.ScreenFocus.scroll.x,
        y: this.objectPhysics.position.y + GameGlobal.ScreenFocus.scroll.y
    };

    this.position.x = screenPos.x;
    this.position.y = screenPos.y;
};

PlayerAsset.prototype.updateSpeed = function() {

    if (this.objectPhysics.velocity.x < 0) { this.objectPhysics.velocity.x = 0; }
    else if (this.objectPhysics.velocity.x < 100) { this.objectPhysics.acceleration.x = 60; }
    else if (this.objectPhysics.velocity.x < 250) { this.objectPhysics.acceleration.x = 36; }
    else if (this.objectPhysics.velocity.x < 400) { this.objectPhysics.acceleration.x = 24; }
    else if (this.objectPhysics.velocity.x < 600) { this.objectPhysics.acceleration.x = 12; }
    else { this.objectPhysics.acceleration.x = 4; }
};

PlayerAsset.prototype.updateJump = function() {

    if (this.objectPhysics.velocity.y === this.objectPhysics.maxVelocity.y) {
        this.my += GameGlobal.TimeKeeper.elapsedSec;
    }
    
    if (this.onFloor) {
        this.objectPhysics.velocity.y = 0;
        this.objectPhysics.acceleration.y = 0;
    } else {
        this.objectPhysics.acceleration.y = PlayerAsset.GRAVITY;
    }
    
    if (this.jump > 0) {
        if (this.jump < 0.08) {
            this.objectPhysics.velocity.y = -this.maxVelocity.y * 0.65;
        }
        else {
            this.objectPhysics.velocity.y = -this.maxVelocity.y;
        }
    }

    
    this.jumpLimit = this.objectPhysics.velocity.x / (this.maxVelocity.x * 2.5);
    if (this.jumpLimit > 0.35) { this.jumpLimit = 0.35; }


    if (this.onFloor) {
        this.jump = 0;
    } else {
        
        // check for jump release
        if (this.prevJump === this.jump) {
            this.jump = -1;
        } else {
            this.prevJump = this.jump;
        }
    }
};

PlayerAsset.prototype.updateAnimation = function() {
    if (this.onFloor && this.stumble && this.textures !== this.stumbleFrames) {
        this.loop = false;
        this.animationSpeed = 0.3;
        this.textures = this.stumbleFrames;
        this.gotoAndPlay(0);
    } else if (this.onFloor && this.textures !== this.run1Frames && (this.textures !== this.stumbleFrames || !this.playing)) {
        this.loop = true;
        this.animationSpeed = 0.5;
        this.textures = this.run1Frames;
        this.gotoAndPlay(0);
    } else if (this.jump > 0 && this.textures !== this.jumpFrames) {
        this.animationSpeed = 0.1;
        this.textures = this.jumpFrames;
        this.gotoAndPlay(0);
    } else if (!this.onFloor && this.objectPhysics.velocity.y > 0 && this.textures !== this.fallFrames) {
        this.loop = true;
        this.animationSpeed = 0.2;
        this.textures = this.fallFrames;
        this.gotoAndPlay(0);
    }
};

PlayerAsset.prototype.updateSound = function() {
    if (this.onFloor) {
        var ft = (1 - this.objectPhysics.velocity.x / this.objectPhysics.maxVelocity.x) * 0.35;
        ft = Math.max(ft, 0.15);

        this.fc += GameGlobal.TimeKeeper.elapsedSec;

        if (this.fc > ft) {
            this.fc = 0;

            if (this.craneFeet) {
                GameGlobal.SoundPlayer.sound.play(this.feetC[Util.random(this.feetC.length - 1)]);
                this.craneFeet = false;
            } else {
                GameGlobal.SoundPlayer.sound.play(this.feet[Util.random(this.feet.length - 1)]);
            }
        }
    }

    if (this.stumble) {
        GameGlobal.SoundPlayer.sound.play('tumble');
    }
};


PlayerAsset.prototype.hitBottom = function(y) {
    this.objectPhysics.position.y = y - GameGlobal.ScreenFocus.scroll.y;
    this.onFloor = true;

    if (this.my > 0.16) {
        this.stumble = true;
    }
    this.my = 0;
};

PlayerAsset.prototype.hitUp = function(y) {
    //this.position.y = y;
    this.objectPhysics.position.y = y - GameGlobal.ScreenFocus.scroll.y;
    this.objectPhysics.velocity.y = 0;
};

PlayerAsset.prototype.hitLeft = function(x) {
    GameGlobal.SoundPlayer.sound.play('wall');

    this.objectPhysics.acceleration.x = 0;
    this.objectPhysics.velocity.x = 0;
    this.objectPhysics.maxVelocity.y = 1000;

    this.epitaph = "hit";

    this.objectPhysics.position.x = x - GameGlobal.ScreenFocus.scroll.x;
};

PlayerAsset.prototype.hitObstacle = function() {
    this.stumble = true;
    this.objectPhysics.velocity.x *= 0.7;
};

PlayerAsset.prototype.buildSounds = function() {
    this.feet = ['foot1', 'foot2', 'foot3', 'foot4', ''];
    this.feetC = ['footc1', 'footc2', 'footc3', 'footc4', ''];
};

PlayerAsset.prototype.buildFrames = function() {
    this.run1Frames = [];
    this.run2Frames = [];
    this.jumpFrames = [];
    this.fallFrames = [];
    this.stumbleFrames = [];

    for (var i = 1; i <= 38; i++) {

        if (i <= 16) {
            this.run1Frames.push(this.getFrameTexture(i));
            
            if (i % 2 === 1) {
                this.run2Frames.push(this.getFrameTexture(i));
            }
        } else if (i <= 19) {
            this.jumpFrames.push(this.getFrameTexture(i));
        } else if (i <= 26) {
            this.fallFrames.push(this.getFrameTexture(i));
        } else if (i <= 38) {
            this.stumbleFrames.push(this.getFrameTexture(i));
        }
    }
};

PlayerAsset.prototype.getFrameTexture = function(i) {
    return PIXI.Texture.fromFrame('raw/player' + i + '.png');
};

PlayerAsset.prototype.bindKeyHandlers = function() {
    kd.Z.down(this.jumpPressed.bind(this));
};
