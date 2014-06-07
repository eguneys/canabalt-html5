'use strict';

function Main() {
    this.stage = new PIXI.Stage(0xffb0b0bf);
    this.renderer =  PIXI.autoDetectRenderer(1024,512,
                                            $('#game-canvas')[0]);

    this.width = $('#game-canvas').width();
    this.height = $('#game-canvas').height();
    
    this.loadSounds();
}

Main.prototype.loadSounds = function() {
    GameGlobal.SoundPlayer.onComplete = this.soundsLoaded.bind(this);
    GameGlobal.SoundPlayer.load();
};

Main.prototype.loadSpriteSheet = function() {
    
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    
    var assetsToLoad = ['data/sprites/canabaltpnotrim0.json', 'data/sprites/canabaltpnotrim1.json', 'data/sprites/canabaltBack.json'];
    var loader = new PIXI.AssetLoader(assetsToLoad);
    loader.onComplete = this.spriteSheetLoaded.bind(this);
    loader.load();
};

Main.prototype.soundsLoaded = function() {
    this.loadSpriteSheet();
};

Main.prototype.spriteSheetLoaded = function() {

    GameGlobal.PoolKeeper.createPools();
    
    this.scroller = new PlayState(this.stage, this.width, this.height);
    
    window.requestAnimationFrame(this.update.bind(this));
};

Main.prototype.update = function(timestamp) {

    GameGlobal.TimeKeeper.update(timestamp);
    GameGlobal.ScreenQuake.update();

    this.scroller.update();
    
    this.renderer.resize($('#game-canvas').width(), $('#game-canvas').height());
    this.renderer.render(this.stage);

    // KeyDown Keyboard Handler
    kd.tick();
    
    window.requestAnimationFrame(this.update.bind(this));
};

$(document).ready(function () {
    new Main();
});
