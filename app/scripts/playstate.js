'use strict';

function PlayState(stage, width, height) {

    this.width = width;
    this.height = height;
    this.zoom = 2;

    this.stage = stage;
    
    GameGlobal.ScreenFocus.setFocusData(width / this.zoom, height / this.zoom);

    GameGlobal.ScreenQuake.initWithScreenData(this.zoom, width, height);
    GameGlobal.ScreenQuake.setScale(0, 1);
    
    this.far = new ScrollBackground('raw/background.png', -0.15, 0.25, 50);
    this.mid = new ScrollBackground('midground3.png', -0.4, 0.5, 104 + 8);
    this.front = new ScrollForeground(WallSlice.WIDTH, WallSlice.WIDTH * this.zoom);
    this.pigeonLayer = new ScrollForeground(WallSlice.WIDTH, WallSlice.WIDTH * this.zoom);

    this.obstacleLayer = new ScrollForeground(WallSlice.WIDTH, WallSlice.WIDTH * this.zoom);

    this.decorationLayer = new ScrollForeground(WallSlice.WIDTH, WallSlice.WIDTH * this.zoom);

    this.player = new PlayerAsset();
    this.front.setPlayer(this.player);
    this.pigeonLayer.setPlayer(this.player);
    this.obstacleLayer.setPlayer(this.player);

    this.shardLayer = new ShardsAsset();
    this.front.setShards(this.shardLayer);

    this.walkerLayer = new ScrollWalker();

    this.jet = new Jet();

    this.gibEmitter = new GibEmitter({
        quantity: 40,
        delay: -3,
        minParticleSpeed: { x: -240, y: -320 },
        maxParticleSpeed: { x: 240, y: 0 },
        minRotation: 0,
        maxRotation: 0,
        gravity: 800,
    });

    this.viewArea = new PIXI.DisplayObjectContainer();

    this.viewArea.addChild(this.jet.jet());
    this.viewArea.addChild(this.decorationLayer);
    this.viewArea.addChild(this.front);
    this.viewArea.addChild(this.pigeonLayer);
    this.viewArea.addChild(this.shardLayer);
    this.viewArea.addChild(this.obstacleLayer);
    this.viewArea.addChild(this.gibEmitter);
    this.viewArea.addChild(this.player);

    this.viewArea.scale.x = this.zoom;
    this.viewArea.scale.y = this.zoom;
    
    this.viewArea.x -= WallSlice.WIDTH * this.zoom * 5;

    this.far.scale.x = this.zoom;
    this.far.scale.y = this.zoom;
    this.mid.scale.x = this.zoom;
    this.mid.scale.y = this.zoom;

    this.walkerLayer.scale.x = this.zoom;
    this.walkerLayer.scale.y = this.zoom;
    
    stage.addChild(this.far);
    stage.addChild(this.walkerLayer);
    stage.addChild(this.mid);
    stage.addChild(this.viewArea);


    this.dist = new HUD(this.width - 80 - 5, 5, 80);
    this.dist.setDistance(0);
    stage.addChild(this.dist);
    
    this.mapBuilder = new MapBuilder(this.player, this.front, this.pigeonLayer, this.shardLayer, this.obstacleLayer, this.decorationLayer, this.gibEmitter);


    this.focus = { x: 0, y: 0 };
    GameGlobal.ScreenFocus.follow(this.focus);
    GameGlobal.ScreenFocus.followBounds(0, 0, Number.POSITIVE_INFINITY, this.height);

    GameGlobal.ScreenQuake.startWithIntensity(0.007, 3.1);
    GameGlobal.SoundPlayer.sound.play('crumble');
}


PlayState.prototype.update = function() {
    var wasDead = this.player.dead;
    
    this.updateChildren();
    this.dist.setDistance(Math.ceil(this.player.objectPhysics.position.x / 10));

    if (this.player.dead && !wasDead) {
        var distance = Math.round(this.player.objectPhysics.position.x / 10);

        this.updatePlayerEpitaph(distance);
        
        this.gameOver = new GameOver(this.width / this.zoom, this.height / this.zoom, distance, this.player);

        this.gameOver.scale.x = this.zoom;
        this.gameOver.scale.y = this.zoom;
        
        this.stage.addChild(this.gameOver);
    }
};

PlayState.prototype.updateChildren = function() {
    this.mapBuilder.update();
    
    GameGlobal.ScreenFocus.doFollow();

    this.focus.x = this.player.objectPhysics.position.x + GameGlobal.ScreenFocus.width * 0.5 - (WallSlice.WIDTH * this.zoom * 5);
    this.focus.y = this.player.objectPhysics.position.y + GameGlobal.ScreenFocus.height * 0.18;


    this.focus.x += GameGlobal.ScreenQuake.pos.x * 2;
    this.focus.y += GameGlobal.ScreenQuake.pos.y * 2;
    
    this.player.update();

    var viewportX = -GameGlobal.ScreenFocus.scroll.x;
    var viewportY = GameGlobal.ScreenFocus.scroll.y;

    this.decorationLayer.setViewportX(viewportX, viewportY);
    
    this.obstacleLayer.setViewportX(viewportX, viewportY);
    this.pigeonLayer.setViewportX(viewportX, viewportY);
    this.shardLayer.setViewportX(viewportX, viewportY);
    
    this.front.setViewportX(viewportX, viewportY);

    this.far.setViewportX(viewportX, viewportY);
    this.mid.setViewportX(viewportX, viewportY);

    this.walkerLayer.update();
    this.jet.update();

    this.gibEmitter.update();
};


PlayState.prototype.updatePlayerEpitaph = function(distance) {
    if (this.player.epitaph === 'bomb') {
    } else if (this.player.epitaph === 'hit') {
        if (distance < 105) {
            this.player.epitaph = 'just barely\nstumbling out of the first hallway.';
        } else {
            var type = this.mapBuilder.getType();
            switch (type) {
            case MapBuilder.TYPES.HALLWAY: {
                this.player.epitaph = '\nmissing another window.';
            } break;
            case MapBuilder.TYPES.COLLAPSE: {
                this.player.epitaph = '\nknocking a building down.';
            } break;
            case MapBuilder.TYPES.CRANE: {
                this.player.epitaph = 'somehow\n hitting the edge of a crane.';
            } break;
            case MapBuilder.TYPES.BILLBOARD: {
                this.player.epitaph = 'somehow\nhitting the edge of a billboard.';
            } break;
            case MapBuilder.TYPES.LEG: {
                this.player.epitaph = 'colliding\nwith some enourmous obstacle.';
            } break;
            default: {
                this.player.epitaph = 'hitting\na wall and tumbling to your death.';
            } break;
            };
        }
    } else {
        // fell off the screen
        var preType = this.mapBuilder.getType(); // TODO: improve
        var type = this.mapBuilder.nextType();

        if (type > 0) {
            switch (type) {
            case MapBuilder.TYPES.HALLWAY: {
                this.player.epitaph = 'completely\n missing the entire hallway.';
            } break;
            case MapBuilder.TYPES.CRANE: {
                this.player.epitaph = '\n missing a crane completely.';
            } break;
            case MapBuilder.TYPES.BILLBOARD: {
                this.player.epitaph = 'not\nquite reaching a billboard.';
            } break;
            case MapBuilder.TYPES.LEG: {
                this.player.epitaph = 'landing\nwhere a building used to be.';
            } break;
            default: {
                this.player.epitaph = '\nfalling to your death.';
            } break;
            }
        } else {
            switch (preType) {
            case MapBuilder.TYPES.HALLWAY: {
                this.player.epitaph = '\nfalling out of a hallway.';
            } break;
            case MapBuilder.TYPES.COLLAPSE: {
                this.player.epitaph = 'riding\na falling building all the way down.';
            } break;
            case MapBuilder.TYPES.BOMB: {
                this.player.epitaph = 'dodging\n a bomb only to miss the next roof.';
            } break;
            case MapBuilder.TYPES.CRANE: {
                this.player.epitaph = '\nfalling off a crane.';
            } break;
            case MapBuilder.TYPES.BILLBOARD: {
                this.player.epitaph = '\nstumbling off the edge of a billboard.';
            } break;
            case MapBuilder.TYPES.LEG: {
                this.player.epitaph = 'jumping\nclear over...something.';
            } break;
            default: {
                this.player.epitaph = '\nfalling to your death.';
            } break;
            }
        }
    }
};
