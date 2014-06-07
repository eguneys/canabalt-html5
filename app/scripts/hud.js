'use strict';

function HUD(x, y, width) {
    PIXI.DisplayObjectContainer.call(this);

    this.width = width;
    
    this.textures = [];
    this.buildTextures();

    this.sprites = [];
    this.buildSprites();
    
    this.position = { x: x, y: y };
};

HUD.constructor = HUD;
HUD.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

HUD.DIGITS = 6;

HUD.prototype.setDistance = function(newDistance) {
    if (this.distance === newDistance) { return; }

    this.distance = newDistance;

    this.updateCoordinates();
};

HUD.prototype.updateCoordinates = function() {
    var digits = [];
    var tmpDistance = this.distance;

    for (var i = 1; i < HUD.DIGITS + 1; ++i) {
        digits[i] = tmpDistance%10;
        tmpDistance = Math.floor(tmpDistance/10);
    }

    digits[0] = 10;
    
    var runningWidth = 0;
    for (var j = 0; j < HUD.DIGITS + 1; ++j) {
        var dsprite = this.sprites[j];

        dsprite.texture = this.textures[digits[j]];
        
        runningWidth += dsprite.width;

        dsprite.position.x = this.width - runningWidth;
    }

    var blank = true;
    for (var k = HUD.DIGITS; k >= 1; --k) {
        if (digits[k] != 0) {
            blank = false;
        }

        if (blank) {
            this.sprites[k].visible = false;
        } else {
            this.sprites[k].visible = true;
        }
    }
};

HUD.prototype.buildSprites = function() {
    for (var i = 0; i<HUD.DIGITS + 1; i++) {
        this.sprites[i] = new PIXI.Sprite(this.textures[0]);
        this.addChild(this.sprites[i]);
    }
};

HUD.prototype.buildTextures = function() {
    for (var i = 0; i<11; i++) {
        this.textures[i] = PIXI.Texture.fromFrame('hud' + i + '.png');
    }
};
