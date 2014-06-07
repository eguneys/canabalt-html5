'use strict';

function ObjectPool() {

    this.createObjectPool();
}

ObjectPool.prototype.createObjectPool = function() {
    this.containerLookup = [];
};

ObjectPool.prototype.borrowObjectFromContainer = function(container) {
    return container.shift();
};

ObjectPool.prototype.returnObjectToContainer = function(obj, container) {
    container.push(obj);
};

ObjectPool.prototype.borrowObject = function(objType) {
    var obj = this.borrowObjectFromContainer(this.containerLookup[objType]);
    
    if (!obj) {
        console.log('out of ' + objType);
    }
    
    return obj;
};

ObjectPool.prototype.returnObject = function(objType, obj) {
    this.returnObjectToContainer(obj, this.containerLookup[objType]);
};


function SpriteObjectPool() {
    ObjectPool.call(this);
}

SpriteObjectPool.constructor = SpriteObjectPool;
SpriteObjectPool.prototype = Object.create(ObjectPool.prototype);


SpriteObjectPool.prototype.createObjectPool = function() {
    ObjectPool.prototype.createObjectPool.call(this);

    
    this.createObject4Variation(500, 'raw/roof{0}-middle.png', SliceType.ROOF_MIDDLE);
    this.createObject4Variation(100, 'raw/roof{0}-left.png', SliceType.ROOF_LEFT);
    this.createObject4Variation(100, 'raw/roof{0}-right.png', SliceType.ROOF_RIGHT);
    this.createObject4Variation(1000, 'raw/wall{0}-middle.png', SliceType.WALL_MIDDLE);
    this.createObject4Variation(1000, 'raw/wall{0}-left.png', SliceType.WALL_LEFT);
    this.createObject4Variation(1000, 'raw/wall{0}-right.png', SliceType.WALL_RIGHT);

    this.createObjectNVariation2(500, 'raw/roof{0}-middle-cracked{1}.png', SliceType.ROOF_MIDDLE_CRACKED, 4, 8);
    this.createObjectNVariation2(100, 'raw/roof{0}-left-cracked{1}.png', SliceType.ROOF_LEFT_CRACKED, 4, 8);
    this.createObjectNVariation2(100, 'raw/roof{0}-right-cracked{1}.png', SliceType.ROOF_RIGHT_CRACKED, 4, 8);
    this.createObjectNVariation2(500, 'raw/wall{0}-middle-cracked{1}.png', SliceType.WALL_MIDDLE_CRACKED, 4, 8);
    this.createObjectNVariation2(100, 'raw/wall{0}-left-cracked{1}.png', SliceType.WALL_LEFT_CRACKED, 4, 8);
    this.createObjectNVariation2(100, 'raw/wall{0}-right-cracked{1}.png', SliceType.WALL_RIGHT_CRACKED, 4, 8);
    
    this.createObjectNVariation(10, 'raw/floor{0}-left.png', SliceType.FLOOR_LEFT, 2);
    this.createObjectNVariation(100, 'raw/floor{0}-middle.png', SliceType.FLOOR_MIDDLE, 2);
    this.createObjectNVariation(10, 'raw/floor{0}-right.png', SliceType.FLOOR_RIGHT, 2);

    this.createObjectNVariation(100, 'raw/hall{0}1.png', SliceType.HALL_LEFT, 2);
    this.createObjectNVariation(500, 'raw/hall{0}2.png', SliceType.HALL_MIDDLE, 2);
    this.createObjectNVariation(100, 'raw/hall{0}3.png', SliceType.HALL_RIGHT, 2);

    this.createSpriteObject(10, 'raw/crane11.png', SliceType.CRANE1_LEFT);
    this.createSpriteObject(100, 'raw/crane12.png', SliceType.CRANE1_MIDDLE);
    this.createSpriteObject(10, 'raw/crane13.png', SliceType.CRANE1_RIGHT);

    this.createSpriteObject(50, 'raw/crane2.png', SliceType.CRANE2);
    this.createSpriteObject(10, 'raw/crane3.png', SliceType.CRANE3);
    this.createSpriteObject(10, 'raw/crane4.png', SliceType.CRANE4);
    this.createSpriteObject(10, 'raw/crane5.png', SliceType.CRANE5);
    

    this.createSpriteObject(100, 'raw/girder216.png', SliceType.GIRDER2);
    this.createSpriteObject(500, 'raw/block.png', SliceType.BLOCK);

    this.createObjectNVariation(50, 'raw/glass{0}.png', SliceType.GLASS, 48);

    this.createObject4Variation(10, 'raw/doors{0}.png', SliceType.DOOR);
    
    this.createObject4Variation(500, 'raw/window{0}1.png', SliceType.WINDOW);
    this.createObject4Variation(500, 'raw/window{0}2.png', SliceType.WINDOW + 10);
    this.createObject4Variation(500, 'raw/window{0}3.png', SliceType.WINDOW + 20);
    this.createObject4Variation(500, 'raw/window{0}4.png', SliceType.WINDOW + 30);

    this.createSpriteObject(50, 'raw/fence.png', SliceType.FENCE);
    
    this.createSpriteObject(100, 'raw/slope1.png', SliceType.SLOPE_LEFT);
    this.createSpriteObject(1000, 'raw/slope2.png', SliceType.SLOPE_MIDDLE);
    this.createSpriteObject(100, 'raw/slope3.png', SliceType.SLOPE_RIGHT);

    this.createSpriteObject(100, 'raw/pipe11.png', SliceType.PIPE1_LEFT);
    this.createSpriteObject(1000, 'raw/pipe12.png', SliceType.PIPE1_MIDDLE);
    this.createSpriteObject(100, 'raw/pipe13.png', SliceType.PIPE1_RIGHT);

    this.createSpriteObject(100, 'raw/pipe2.png', SliceType.PIPE2);

    this.createSpriteObject(10, 'raw/reservoir.png', SliceType.RESERVOIR);

    
    this.createObjectNVariation(20, 'raw/antenna{0}.png', SliceType.ANTENNA, 7);

    this.createSpriteObject(50, 'raw/ac.png', SliceType.AC);
    this.createSpriteObject(50, 'raw/skylight.png', SliceType.SKYLIGHT);
    this.createSpriteObject(50, 'raw/access.png', SliceType.ACCESS);

    this.createSpriteObject(50, 'raw/escape.png', SliceType.ESCAPE);

    this.createObjectNVariation(50, 'raw/obstacles1{0}.png', SliceType.OBSTACLES, 4);
    this.createObjectNVariation(50, 'raw/obstacles2{0}.png', SliceType.OBSTACLES2, 2);

    this.createObjectNVariation(500, 'raw/demo_gibs{0}.png', SliceType.GIBS, 6);

    this.createObjectNVariation(250, 'raw/smoke{0}.png', SliceType.SMOKE, 4);

    this.createSpriteObject(2, 'raw/bomb.png', SliceType.BOMB);
    this.createSpriteObject(1, 'raw/jet.png', SliceType.JET);
};


SpriteObjectPool.prototype.createSpriteObject = function(amount, frame, name) {
    this.containerLookup[name] = [];
    this.addSprites(amount, frame, this.containerLookup[name]);
};

SpriteObjectPool.prototype.addSprites = function(amount, frame, container) {
    for (var i = 0; i< amount; i++) {
        var sprite = PIXI.Sprite.fromFrame(frame);
        container.push(sprite);
    }
};

SpriteObjectPool.prototype.createObject4Variation = function(amount, frame, type) {
    this.createObjectNVariation(amount, frame, type, 4);
};

SpriteObjectPool.prototype.createObjectNVariation = function(amount, frame, type, n) {
    function format(str, param) {
        return str.replace('{0}', param);
    }

    for (var i = 0; i < n; i++) {
        this.createSpriteObject(amount, format(frame, i + 1), type + i);
    }
};

SpriteObjectPool.prototype.createObjectNVariation2 = function(amount, frame, type, n1, n2) {
    function format(str, param1, param2) {
        return str.replace('{0}', param1).replace('{1}', param2);
    }

    for (var i1 = 0; i1 < n1; i1++) {
        for (var i2 = 0; i2 < n2; i2++) {
            this.createSpriteObject(amount, format(frame, i1 + 1, i2 + 1), type + (i1 * n2) + i2);
        }
    }
};


function MovieObjectPool() {
    ObjectPool.call(this);
}


MovieObjectPool.constructor = MovieObjectPool;
MovieObjectPool.prototype = Object.create(ObjectPool.prototype);


MovieObjectPool.prototype.createObjectPool = function() {
    ObjectPool.prototype.createObjectPool.call(this);
    
    this.createMovieObject(100, 'raw/dove{0}.png', 4, SliceType.PIGEON);
    this.createMovieObject(50, 'raw/walker{0}.png', 12, SliceType.WALKER);
};


MovieObjectPool.prototype.createMovieObject = function(amount, frame, framecount, name) {
    this.containerLookup[name] = [];
    this.addMovies(amount, frame, framecount, this.containerLookup[name]);
};

MovieObjectPool.prototype.addMovies = function(amount, frame, framecount, container) {
    for (var i = 0; i< amount; i++) {
        var movie = this.createMovie(frame, framecount);
        container.push(movie);
    }
};

MovieObjectPool.prototype.createMovie = function(frame, count) {
    var textures = [], texture;
    
    for (var i = 1; i <= count; i++) {
        texture = PIXI.Texture.fromFrame(Util.format(frame, i));
        textures.push(texture);
    }
    var movie = new PIXI.MovieClip(textures);
    return movie;
};


function GraphicObjectPool() {
    ObjectPool.call(this);
}

GraphicObjectPool.prototype.constructor = GraphicObjectPool;
GraphicObjectPool.prototype = Object.create(ObjectPool.prototype);

GraphicObjectPool.prototype.createObjectPool = function() {
    ObjectPool.prototype.createObjectPool.call(this);

    this.createGraphicObject(15, this.createGlassWindowGraphic, SliceType.GLASSWINDOW);
    this.createGraphicObject(500, this.createHallGraphic, SliceType.HALL3);
};

GraphicObjectPool.prototype.createGraphicObject = function(amount, fgraphic, name) {
    this.containerLookup[name] = [];

    this.addGraphics(amount, name, fgraphic, this.containerLookup[name]);
};

GraphicObjectPool.prototype.addGraphics = function(amount, name, fgraphic, container) {
    for (var i = 0; i<amount; i++) {
        var graphic = fgraphic(name);
        container.push(graphic);
    }
};

GraphicObjectPool.prototype.createHallGraphic = function() {
    var graphic = new PIXI.Graphics();

    graphic.lineStyle(WallSlice.WIDTH, 0xff35353d, 1);
    graphic.moveTo(0, 0);
    graphic.lineTo(0, WallSlice.HEIGHT + 1);

    return graphic;
};

GraphicObjectPool.prototype.createGlassWindowGraphic = function() {
    var graphic = new PIXI.Graphics();

    graphic.lineStyle(GlassWindow.WIDTH, 0xFFFFFF, 1);
    graphic.moveTo(0, 0);
    graphic.lineTo(0, WallSlice.HEIGHT);
        
    return graphic;
};
