'use strict';

function ScrollMovie(frames) {
    PIXI.MovieClip.call(this, frames);
}

ScrollMovie.constructor = ScrollMovie;
ScrollMovie.prototype = Object.create(PIXI.MovieClip.prototype);

ScrollMovie.prototype.update = function() { };

function ScrollSprite(sprite, physics) {
    physics = physics || new ObjectPhysics({});
    
    this.sprite = sprite;
    this.scrollFactor = { x: 1, y: 1 };

    this.physics = physics;

    this.translateSprite = function(x, y) {
        this.physics.position.x = x - (GameGlobal.ScreenFocus.scroll.x * this.scrollFactor.x);
        this.physics.position.y = y - (GameGlobal.ScreenFocus.scroll.y * this.scrollFactor.y);

        this.render();
    };
    
    this.render = function() {
        var position =  this.getScreenXY();
        this.sprite.position.x = position.x;
        this.sprite.position.y = position.y;
    };

    this.getScreenXY = function() {
        return {
            x: this.physics.position.x + GameGlobal.ScreenFocus.scroll.x * this.scrollFactor.x,
            y: this.physics.position.y + GameGlobal.ScreenFocus.scroll.y * this.scrollFactor.y
        };
    };
}

ScrollSprite.prototype.update = function()
{
    this.physics.update();
    this.sprite.rotation = this.physics.rotation;
};

function ScrollAnimation(texture) {
    this.clip = null;
    this.texture = texture;
    this.frames = [];
}

ScrollAnimation.prototype.addAnimation = function(name, ints, speed, loop) {
    var that = this;
    var textures = ints.reduce(function(p, c) { p.push(that.getFrameTexture(c)); return p; }, []);
    
    this.frames[name] = {
        textures: textures,
        speed: speed,
        loop: loop
    };

};

ScrollAnimation.prototype.play = function(name) {
    var animation = this.frames[name];
    this.clip = this.clip || new PIXI.MovieClip(animation.textures);
    
    this.clip.textures = animation.textures;
    this.clip.loop = animation.loop;
    this.clip.animationSpeed = animation.speed;
    this.clip.gotoAndPlay(0);
};

ScrollAnimation.prototype.finished = function() {
    return !this.clip.playing;
};

ScrollAnimation.prototype.getFrameTexture = function(i) {
    return PIXI.Texture.fromFrame(Util.format(this.texture, i));
};
