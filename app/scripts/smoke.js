'use strict';

function Smoke() {
    this.type = SliceType.SMOKE;

    var sprite = GameGlobal.PoolKeeper.borrowWallSprite(this.type);

    this.objectPhysics = new ObjectPhysics({
        position: { x: 0, y: 0 },
        velocity: { x: -3 + 6 * Math.random(), y: -15 + 30 * Math.random() },
        angularVelocity: -0.08 + 0.16 * Math.random()
    });

    this.scrollSprite = new ScrollSprite(sprite, this.objectPhysics);

    this.scrollSprite.scrollFactor = { x: 0.1, y: 0.05 };
}

Smoke.prototype.updateSprite = function() {
    this.scrollSprite.update();
    this.scrollSprite.render();
};

Smoke.prototype.removeSprite = function() {
    var sprite = this.scrollSprite.sprite;
    GameGlobal.PoolKeeper.returnWallSprite(sprite);
};

function SmokeEmitter() {
    PIXI.DisplayObjectContainer.call(this);

    this.smokes = [];

    this.addSmokes();
}

SmokeEmitter.constructor = SmokeEmitter;
SmokeEmitter.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

SmokeEmitter.prototype.reset = function(x, y) {
    this.position.x = x;
    this.position.y = y;
    
    for (var i = 0; i< this.smokes.length; i++) {
        var smoke = this.smokes[i];
        smoke.objectPhysics.position.x = 0;
        smoke.objectPhysics.position.y = 0;
    }
};

SmokeEmitter.prototype.addSmokes = function() {
    for (var i = 0; i < 25; i++) {
        var smoke = new Smoke();
        this.smokes.push(smoke);
        this.addChild(smoke.scrollSprite.sprite);
    }
};

SmokeEmitter.prototype.update = function() {
    this.updateSmokes();
};

SmokeEmitter.prototype.updateSmokes = function() {
    for (var i = 0; i< this.smokes.length; i++) {
        this.smokes[i].updateSprite();
    }
};
