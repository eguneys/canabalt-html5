'use strict';

function Walker(smokes) {
    this.type = SliceType.WALKER;

    this.firing = false;
    this.walkTimer = 0;
    this.idleTimer = 0;

    this.objectPhysics = new ObjectPhysics({
        position: { x: -500, y: 40 + Math.random() * 10 }
    });

    this.smokesObject = smokes;

    this.animation = new ScrollAnimation('raw/walker{0}.png');

    this.animation.addAnimation('idle', [1], 1, false);
    this.animation.addAnimation('walk', [1, 2, 3, 4, 5, 6], 0.1, true);
    this.animation.addAnimation('fire', [7,8,9,10,11, 12], 0.05, false);

    this.animation.play('idle');

    var sprite = this.animation.clip;
    
    this.scrollSprite = new ScrollSprite(sprite, this.objectPhysics);
    this.scrollSprite.scrollFactor = { x: 0.1, y: 0.15 };
}

Walker.prototype.update = function() {
    this.scrollSprite.update();
    this.scrollSprite.render();

    this.updateAnimation();
};

Walker.prototype.updateAnimation = function() {
    if (this.walkTimer > 0) {
        this.walkTimer -= GameGlobal.TimeKeeper.elapsedSec;
        if (this.walkTimer <= 0) {
            this.animation.play('fire');
            this.firing = true;
            this.objectPhysics.velocity.x = 0;
            // smokes
            this.updateSmokes();
        }
    } else if (this.firing) {
        if (this.animation.finished()) {
            this.firing = false;
            this.idleTimer = 1 + Math.random() * 2;
            this.animation.play('idle');
        }
    } else if (this.idleTimer > 0) {
        this.idleTimer -= GameGlobal.TimeKeeper.elapsedSec;

        if (this.idleTimer <= 0) {
            if (Math.random() < 0.5) {
                this.walkTimer = 2 + Math.random() * 4;
                this.animation.play('walk');
                this.objectPhysics.velocity.x = (this.facing?40:-40);
            } else {
                this.animation.play('fire');
                this.firing = true;
                // smokes
                this.updateSmokes();
            }
        }
    }

    var p = this.scrollSprite.getScreenXY();
    
    var width = Math.abs(this.scrollSprite.sprite.width);

    if (p.x + width * 2 < 0) {
        this.walkTimer = Math.random() * 2;
        this.facing = Math.random() > 0.5? true:false;
        this.objectPhysics.position.x += GameGlobal.ScreenFocus.width + width * 2 + Math.random() * GameGlobal.ScreenFocus.width;
        
        if (!this.facing) {
            this.scrollSprite.sprite.scale.x = Math.abs(this.scrollSprite.sprite.scale.x);
            this.scrollSprite.sprite.anchor.x = 0;
        } else {
            this.scrollSprite.sprite.scale.x = - Math.abs(this.scrollSprite.sprite.scale.x);
            this.scrollSprite.sprite.anchor.x = 1;
        }
    }
};

Walker.prototype.updateSmokes = function() {
    ++this.smokesObject.s;
    this.smokesObject.s = this.smokesObject.s % this.smokesObject.smokes.length;

    var smoke = this.smokesObject.smokes[this.smokesObject.s];
    
    var smokePos = {
        x: this.objectPhysics.position.x + (this.facing ? (Math.abs(this.scrollSprite.sprite.width)-22) : 10),
        y: this.objectPhysics.position.y + this.scrollSprite.sprite.height
    };

    smoke.reset(smokePos.x, smokePos.y);
};

Walker.prototype.remove = function() {
    var sprite = this.scrollSprite.sprite;
    GameGlobal.PoolKeeper.returnMovieSprite(sprite);
};

function ScrollWalker() {
    PIXI.DisplayObjectContainer.call(this);

    this.walkerCap = 3;
    
    this.walkers = [];

    this.smokesObject = {
        smokes: [],
        s: 0
    };

    this.addSmokes();
    this.addWalkers();
}

ScrollWalker.constructor = ScrollWalker;
ScrollWalker.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

ScrollWalker.prototype.update = function() {
    
    for (var i = 0; i< this.walkers.length; i++) {
        var walker = this.walkers[i];

        walker.update();
    }

    for (i = 0; i<this.smokesObject.smokes.length; i++) {
        var smoke = this.smokesObject.smokes[i];
        smoke.update();
    }
};

ScrollWalker.prototype.addSmokes = function() {
    for (var i = 0; i<10; i++) {
        var smoke = new SmokeEmitter();
        this.smokesObject.smokes.push(smoke);
        this.addChild(smoke);
    }
};

ScrollWalker.prototype.addWalkers = function() {
    for (var i = 0; i<this.walkerCap; i++) {
        var walker = new Walker(this.smokesObject);
        this.walkers.push(walker);
        this.addChild(walker.scrollSprite.sprite);
    }

};
