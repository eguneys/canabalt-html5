'use strict';

function Jet() {
    this.type = SliceType.JET;

    this.timer = 0;
    this.limit = 12 + Math.random() * 4;
    
    this.objectPhysics = new ObjectPhysics({
        position: { x: -500, y: 0 },
        velocity: { x: -1200, y: 0 }
    });

    var sprite = GameGlobal.PoolKeeper.borrowWallSprite(this.type);
    this.scrollSprite = new ScrollSprite(sprite, this.objectPhysics);
    this.scrollSprite.scrollFactor = { x: 0, y: 0.3 };
}

Jet.prototype.jet = function() {
    return this.scrollSprite.sprite;
};

Jet.prototype.update = function() {
    this.timer += GameGlobal.TimeKeeper.elapsedSec;

    if (this.timer > this.limit) {

        this.scrollSprite.translateSprite(960, -20 + Math.random() * 120);
        
        GameGlobal.ScreenQuake.startWithIntensity(0.02, 1.5);
        //sound
        GameGlobal.SoundPlayer.sound.play('flyby');
        this.timer = 0;
        this.limit = 10 + Math.random() * 20;
    }

    if (this.scrollSprite.sprite.position.x < - this.scrollSprite.sprite.width) {

    } else {
        this.scrollSprite.update();
        this.scrollSprite.render();
    }
};
