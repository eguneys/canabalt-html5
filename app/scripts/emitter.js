'use strict';

function SpriteEmitter(options) {
    PIXI.DisplayObjectContainer.call(this);

    this.members = [];
    this.timer = 0;
    this.counter = 0;
    
    var defaults = {
        minParticleSpeed: { x: -100, y: -100 },
        maxParticleSpeed: { x: 100, y: 100 },
        minRotation: -1,
        maxRotation: 1,
        gravity: 400,
        delay: 0.1,
        quantity: 0
    };

    $.extend(this, defaults, options);
}

SpriteEmitter.constructor = SpriteEmitter;
SpriteEmitter.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

SpriteEmitter.prototype.start = function() {
    this.counter = 0;
};

SpriteEmitter.prototype.update = function() {
    this.updateMembers();
    this.updateEmitter();
};

SpriteEmitter.prototype.updateEmitter = function() {
    this.timer += GameGlobal.TimeKeeper.elapsedSec;

    while ((this.timer > this.delay) && (this.counter < this.quantity)) {
        this.timer -= this.delay;
        
        this.emitParticle();
    }
};

SpriteEmitter.prototype.updateMembers = function() {
    for (var i = 0; i< this.counter; i++) {
        this.members[i].update();
        this.members[i].render();
    }
};

SpriteEmitter.prototype.emitParticle = function() {
    var scrollSprite = this.members[this.counter];

    scrollSprite.physics.position.x = 0;
    scrollSprite.physics.position.y = 0;

    scrollSprite.physics.velocity = {
        x: this.minParticleSpeed.x + Math.random() * (this.maxParticleSpeed.x - this.minParticleSpeed.x),
        y: this.minParticleSpeed.y + Math.random() * (this.maxParticleSpeed.y - this.minParticleSpeed.y)
    };

    scrollSprite.physics.acceleration.y = this.gravity;

    scrollSprite.physics.angularVelocity = this.minRotation + Math.random() * this.maxRotation - this.minRotation;
    
    this.counter++;
};


function GibEmitter(options) {
    SpriteEmitter.call(this, options);

    this.initWithGibCount(options.quantity);
}

GibEmitter.constructor = GibEmitter;
GibEmitter.prototype = Object.create(SpriteEmitter.prototype);


GibEmitter.prototype.initWithGibCount = function(count) {
    for (var i = 0; i< count; i++) {
        var gib = new ScrollSprite(
            GameGlobal.PoolKeeper.borrowWallSprite(SliceType.GIBS + Util.random(5)), new ObjectPhysics());
        this.members.push(gib);
        this.addChild(gib.sprite);
    }
};
