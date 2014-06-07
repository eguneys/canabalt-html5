'use strict';
/* exported GameGlobal */
function poolKeeper() {
    var spritePool, moviePool, graphicPool;
    
    return {

        createPools: function() {
            spritePool = new SpriteObjectPool();
            moviePool = new MovieObjectPool();
            graphicPool = new GraphicObjectPool();
        },

        borrowWallSprite: function(spriteType) {
            return spritePool.borrowObject(spriteType);
        },

        returnWallSprite: function(spriteType, sprite) {
            return spritePool.returnObject(spriteType, sprite);
        },

        borrowMovieSprite: function(movieType) {
            return moviePool.borrowObject(movieType);
        },

        returnMovieSprite: function(movieType, movie) {
            return moviePool.returnObject(movieType, movie);
        },

        borrowGraphic: function(graphicType) {
            return graphicPool.borrowObject(graphicType);
        },

        returnGraphic: function(graphicType, graphic) {
            return graphicPool.returnObject(graphicType, graphic);
        }
        
    };
}


function TimeKeeper() {
    this.prevTime = 0;
    this.elapsed = 0;
    this.elapsedSec = 0;
    
    this.update = function(timestamp) {
        this.elapsed = Math.min(timestamp - this.prevTime, TimeKeeper.MAX_ELAPSED);

        this.elapsedSec = this.elapsed * 0.001;
        
        this.prevTime = timestamp;
    };
}

TimeKeeper.MAX_ELAPSED = 20;

function ScreenFocus() {
    this.followTarget = null;
    this.followMin = null;
    this.followMax = null;
    
    this.scroll = null;
    this.width = 0;
    this.height = 0;
    
    this.setFocusData = function(width, height) {
        this.width = width;
        this.height = height;
    };

    this.follow = function(obj) {
        this.followTarget = obj;

        var scrollTarget = {
            x: (this.width / 2) - this.followTarget.x,
            y: (this.height / 2) - this.followTarget.y
        };

        this.scroll = {
            x: scrollTarget.x,
            y: scrollTarget.y
        };

        this.doFollow();
    };

    this.followBounds = function(minX, minY, maxX, maxY) {
        this.followMin = { x: -minX, y: -minY };
        this.followMax = { x: -maxX + this.width, y: -maxY + this.height };
        
        if (this.followMax.x > this.followMin.x) {
            this.followMax.x = this.followMin.x;
        }
        if (this.followMax.y > this.followMin.y) {
            this.followMax.y = this.followMin.y;
        }

        this.doFollow();
    };

    this.doFollow = function() {
        if (this.followTarget !== null) {
            var scrollTarget = {
                x: (this.width / 2) - this.followTarget.x,
                y: (this.height / 2) - this.followTarget.y
            };

            this.scroll.x += (scrollTarget.x - this.scroll.x) * 15 * GameGlobal.TimeKeeper.elapsedSec;
            this.scroll.y += (scrollTarget.y - this.scroll.y) * 15 * GameGlobal.TimeKeeper.elapsedSec;
        }

        if (this.followMin != null) {
            this.scroll.x = Math.min(this.scroll.x, this.followMin.x);
            this.scroll.y = Math.min(this.scroll.y, this.followMin.y);
        }
        if (this.followMax != null) {
            this.scroll.x = Math.max(this.scroll.x, this.followMax.x);
            this.scroll.y = Math.max(this.scroll.y, this.followMax.y);
        }
    };
}

function ScreenQuake() {
    this.zoom = 0;
    this.width = 0;
    this.height = 0;
    this.intensity = 0;
    this.timer = 0;

    this.scale = { x: 1, y: 1 }
    this.pos = { x: 0, y: 0 }

    this.initWithScreenData = function(zoom, width, height) {
        this.zoom = zoom;
        this.width = width;
        this.height = height;
    }

    this.setScale = function(x, y) {
        this.scale.x = x;
        this.scale.y = y;
    }
    
    this.startWithIntensity = function(intensity, duration) {
        this.stop();
        this.intensity = intensity;
        this.timer = duration;
    };

    this.stop = function() {
        this.pos.x = 0;
        this.pos.y = 0;
        this.intensity = 0;
        this.timer = 0;
    };

    this.update = function() {
        if (this.timer > 0) {
            this.timer -= GameGlobal.TimeKeeper.elapsedSec;
            if (this.timer <= 0) {
                this.timer = 0;
                this.pos.x = 0;
                this.pos.y = 0;
            }
            else {
                this.pos.x = (Math.random() * this.intensity * this.width * 2 - this.intensity * this.width) * this.zoom * this.scale.x;
                this.pos.y = (Math.random() * this.intensity * this.height * 2 - this.intensity * this.height) * this.zoom * this.scale.y;
            }
        }
    };
}

function SoundPlayer() {
    this.jsonLoader = new PIXI.JsonLoader('data/sprites/audiohowler.json');

    this.sound = null;
    this.music = null;
    
    this.onComplete = null;

    this.load = function() {
        this.jsonLoader.onLoaded = this.jsonLoaded.bind(this);
        this.jsonLoader.load();
    };
    
    this.jsonLoaded = function() {
        var howlJson = this.jsonLoader.json;

        howlJson.loop = true;
        howlJson.onload = this.musicLoaded.bind(this);

        this.music = new Howl(howlJson);
    };

    this.musicLoaded = function() {
        var howlJson = this.jsonLoader.json;

        howlJson.loop = false;
        howlJson.onload = this.soundsLoaded.bind(this);
        this.sound = new Howl(howlJson);
    };
    
    this.soundsLoaded = function() {
        if (this.onComplete) {
            this.onComplete();
        }
    };
};

var GameGlobal = (function() {
    var ipoolKeeper = poolKeeper();
    var timeKeeper = new TimeKeeper();
    var screenFocus = new ScreenFocus();
    var screenQuake = new ScreenQuake();
    var soundPlayer = new SoundPlayer();
    
    return {
        PoolKeeper: ipoolKeeper,
        TimeKeeper: timeKeeper,
        ScreenFocus: screenFocus,
        ScreenQuake: screenQuake,
        SoundPlayer: soundPlayer
    };
})();
