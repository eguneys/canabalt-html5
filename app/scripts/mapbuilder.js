'use strict';

function MapBuilder(player, walls, pigeons, shards, obstacles, decorations, gibEmitter) {
    this.player = player;
    
    this.walls = walls;

    this.pigeons = pigeons;

    this.shards = shards;

    this.obstacles = obstacles;

    this.decorations = decorations;

    this.gibEmitter = gibEmitter;

    this.decorator = new MapDecorator();

    this.seq = {
        currIndex: 0
    };
}

MapBuilder.TYPES = {
    ROOF: 0,
    HALLWAY: 1,
    COLLAPSE: 2,
    BOMB: 3,
    CRANE: 4,
    BILLBOARD: 5,
    LEG:  6
};

MapBuilder.WALL_MAXDROP = 5;
MapBuilder.WALL_MAXHEIGHT = 480;

//MapBuilder.prototype.lastType = function() { return this.lastType; };
//MapBuilder.prototype.thisType = function() { return this.thisType; };

MapBuilder.prototype.getType = function() {
    return this.seq.type;
};

MapBuilder.prototype.nextType = function() {
    return this.seq.nextType;
};

MapBuilder.prototype.update = function() {
    while (this.walls.shouldAddSlices()) {
        this.createMap();
    }
};

MapBuilder.prototype.createMap = function() {

    this.seq.type = this.seq.nextType;
    this.seq.nextType = Util.random(MapBuilder.TYPES.LEG);
    
    if (this.seq.currIndex === 0) {
        this.seq.y = 5 * WallSlice.HEIGHT;
        this.seq.width = 60;
        this.seq.gap = 5;
        this.seq.type = MapBuilder.TYPES.HALLWAY;
    } else if (this.seq.currIndex === 1) {
        this.seq.y = 15 * WallSlice.HEIGHT;
        this.seq.width = 40;
        this.seq.gap = 5;
        this.seq.type = MapBuilder.TYPES.ROOF;
    } else {

        var hallHeight = 0;

        if (this.player.objectPhysics.velocity.x > 640) {
            hallHeight = 7;
        } else if (this.player.objectPhysics.velocity.x > 480) {
            hallHeight = 6;
        } else if (this.player.objectPhysics.velocity.x > 320) {
            hallHeight = 5;
        } else if (this.seq.currIndex > 0) {
            hallHeight = 4;
        } else {
            hallHeight = 3;
        }
        
        var maxGap = ((this.player.objectPhysics.velocity.x * 0.75)/20)*0.75;

        var minGap = Math.max(4, maxGap * 0.4);

        var fg = Math.random();
        
        this.seq.gap = minGap + fg * (maxGap - minGap);
        
        var minW = Math.max(6, this.walls.VIEWPORT_NUM_SLICES - this.seq.gap);

        if (minW < 15 && this.player.objectPhysics.velocity.x < this.player.maxVelocity.x * 0.8)
        {
            minW = 15;
        }

        var maxW = minW * 2;
        
        var maxJ = this.seq.y/WallSlice.HEIGHT - 2 - hallHeight;
        var mpj = 6 * this.player.jumpLimit/0.35;
        
        maxJ = Math.min(maxJ, mpj);
        if (maxJ > 0) { maxJ = Math.ceil(maxJ* (1-fg)); }

        var drop = Util.random(MapBuilder.WALL_MAXDROP) - maxJ;

        if (this.seq.type === MapBuilder.TYPES.HALLWAY) {
            drop = 0;
        }
        if (this.seq.type === MapBuilder.TYPES.CRANE) {
            drop = -2;
        }

        if (drop === 0) { --drop; }

        this.seq.y += drop * WallSlice.HEIGHT;
        
        this.seq.width = Math.floor(minW + Util.random(maxW));

        // width must be multiple of 5 because of the pigeons
        var widthMulti = PigeonGroup.WIDTH / WallSlice.WIDTH;
        this.seq.width += widthMulti - (this.seq.width % widthMulti);
    }

    if ((this.seq.type === MapBuilder.TYPES.COLLAPSE && this.seq.width > 55)) {
        this.seq.type = MapBuilder.TYPES.ROOF;
    } else if ((this.seq.type === MapBuilder.TYPES.BOMB && this.seq.width < 90)) {
        this.seq.type = MapBuilder.TYPES.ROOF;
    }
    
    if (this.seq.type === MapBuilder.TYPES.ROOF) {
        this.createWallSpan(this.seq.y, this.seq.width, Util.random(3));
    } else if (this.seq.type === MapBuilder.TYPES.HALLWAY) {
        this.createHall(this.seq.y, hallHeight, this.seq.width, Util.random(1), Util.random(3));
    } else if (this.seq.type === MapBuilder.TYPES.CRANE) {
        this.createCrane(this.seq.y, this.seq.width);
    } else if (this.seq.type === MapBuilder.TYPES.COLLAPSE) {
        this.createCollapse(this.seq.y, this.seq.width, Util.random(3));

        this.seq.y += 3 * WallSlice.HEIGHT;
    } else if (this.seq.type === MapBuilder.TYPES.BOMB) {
        this.createWallSpan(this.seq.y, this.seq.width, Util.random(3), true);
    } else {
        this.createWallSpan(this.seq.y, this.seq.width, 0);
        //this.createCollapse(this.seq.y, this.seq.width, Util.random(3));
        //this.createHall(this.seq.y, 6, this.seq.width, Util.random(1), Util.random(3));
        //this.createCrane(this.seq.y, this.seq.width);
    }

    this.createGap(this.seq.gap);

    
    this.seq.currIndex++;
};

MapBuilder.prototype.createGap = function(spanLength) {
    this.addWallGap(spanLength);
    this.addGapButWall(spanLength);
};

MapBuilder.prototype.createCrane = function(height, spanLength) {

    var flipped = Math.random() < 0.5;
    
    this.addCraneSlice(height, SliceType.CRANE1_LEFT, true);
    this.addWallGap(1);
    this.addGapButWall(2);
    
    this.addCraneMid(height, spanLength, flipped);
    this.addPigeonsOrGap(height, spanLength * 2);
    this.addObstacleGap(spanLength * 2);

    this.addCraneSlice(height, SliceType.CRANE1_RIGHT, true);

    if (flipped) {
        var y = height;
        this.addWallSlices([new WallSlice(SliceType.CRANE3, y + 5, {
            width: WallSlice.CRANE3_WIDTH,
            offsetX: -WallSlice.WIDTH * 3.5,
        })]);
    } else {
        this.addWallGap(1);
    }

    this.addGapButWall(2);
};

MapBuilder.prototype.createHall = function(height, hallHeight, spanLength, floorType, wallType) {
    floorType = floorType || 0;
    wallType = wallType || 0;
    hallHeight = hallHeight || 5;
    
    this.addFloorSlice(height, hallHeight, SliceType.FLOOR_LEFT + floorType, SliceType.WALL_LEFT + wallType, SliceType.HALL_LEFT);
    this.addGlassWindow(height, hallHeight);
    
    this.addFloorMid(height, hallHeight, spanLength, floorType, wallType);

    this.addObstacles(height, spanLength + 2, SliceType.OBSTACLES, 3);
    this.addPigeonGap(spanLength);

    this.addFloorSlice(height, hallHeight, SliceType.FLOOR_RIGHT + floorType, SliceType.WALL_RIGHT + wallType, SliceType.HALL_RIGHT);
    
    this.addGlassWindow(height, hallHeight, true);
};

MapBuilder.prototype.createWallSpan = function(height, spanLength, wallType, bomb) {
    wallType = wallType || 0;
    bomb = bomb || false;

    if (bomb) {
        this.addWallSliceWithBombTrigger(height, SliceType.ROOF_LEFT + wallType, SliceType.WALL_LEFT + wallType);
    } else {
        this.addWallSlice(height, SliceType.ROOF_LEFT + wallType, SliceType.WALL_LEFT + wallType);
    }
        
    this.addGapButWall(1);

    var midSpanLength = spanLength;

    this.addWallMid(height, midSpanLength, wallType, bomb);
    this.addPigeonsOrGap(height, midSpanLength);

    this.addObstacles(height, midSpanLength, SliceType.OBSTACLES2, 2, 0.5);
    
    this.addWallSlice(height, SliceType.ROOF_RIGHT + wallType, SliceType.WALL_RIGHT + wallType);
    this.addGapButWall(1);

    this.addDecorationEscape(height);
    this.addGapButWall(1);
};

MapBuilder.prototype.createCollapse = function(height, spanLength, wallType) {
    wallType = wallType || 0;

    var collapseObject = {
        startCollapsing: false,
        physics: new ObjectPhysics({
            maxVelocity: { x: 0, y: 300 },
            velocity: { x: 0, y: 60 },
            acceleration: { x: 0, y: 40 }
    })};
    
    this.addCollapseSlice(height, SliceType.ROOF_LEFT_CRACKED + wallType * 8, SliceType.WALL_LEFT_CRACKED + wallType * 8, collapseObject);

    this.addCollapseMid(height, spanLength, wallType, collapseObject);
    
    this.addCollapseSlice(height, SliceType.ROOF_RIGHT_CRACKED + wallType * 8, SliceType.WALL_RIGHT_CRACKED + wallType * 8, collapseObject);

    
    this.addGibs(height, spanLength + 2, collapseObject);
    this.addPigeonGap(1);
    this.addPigeonsOrGap(height, spanLength);
    this.addPigeonGap(1);
};


MapBuilder.prototype.addWallMid = function(height, spanLength, wallType, bomb) {
    wallType = wallType || 0;
    bomb = bomb || false;
    var slices, decSlices;
    var y = height;

    this.decorator.buildDecoration(y, spanLength);
    
    for (var i = 0; i < spanLength; i++) {
        slices = [];
        decSlices = [];
        
        this.decorator.addDecorationSlices(decSlices, i);

        if (bomb && i === Math.ceil(spanLength / 2)) {
            slices.push(new BombSlice(height, this.player, this.gibEmitter));
        }
        
        this.buildWindowedWallSlice(slices, height, SliceType.ROOF_MIDDLE + wallType, SliceType.WALL_MIDDLE + wallType, SliceType.WINDOW + wallType);
        
        this.addWallSlices(slices, decSlices);
    }
};

MapBuilder.prototype.addWallSliceWithBombTrigger = function(height, roofSlice, wallSlice) {
    var slices = this.buildWallSlice([], height, roofSlice, wallSlice);

    slices.push(new BombTriggerSlice());
    
    this.addWallSlices(slices);
};

MapBuilder.prototype.addWallSlice = function(height, roofSlice, wallSlice) {
    this.addWallSlices(this.buildWallSlice([], height, roofSlice, wallSlice));
};

MapBuilder.prototype.buildWallSlice = function(slices, height, roofSlice, wallSlice) {
    var y = height;

    slices.push(new WallSlice(roofSlice, y));

    for (var i = y + WallSlice.HEIGHT; i < y + MapBuilder.WALL_MAXHEIGHT; i += WallSlice.HEIGHT) {
        slices.push(new WallSlice(wallSlice,i));
    }

    return slices;
};

MapBuilder.prototype.buildWindowedWallSlice = function(slices, height, roofSlice, wallSlice, windowSlice) {
    var decoration;
    
    var y = height;

    var shouldPlaceWall = true;
    
    slices.push(new WallSlice(roofSlice, y));
    
    for (var i = y + WallSlice.HEIGHT; i < y + MapBuilder.WALL_MAXHEIGHT; i += WallSlice.HEIGHT, shouldPlaceWall = !shouldPlaceWall) {
        if (shouldPlaceWall) {
            slices.push(new WallSlice(wallSlice, i));
        } else {
            decoration = Util.random(3) * 10;
            slices.push(new WallSlice(windowSlice + decoration,i));
        }
    }

    return slices;
};

MapBuilder.prototype.addFloorMid = function(height, hallHeight, spanLength, floorType, wallType) {
    var slices;
    
    for (var i = 0; i < spanLength; i++) {
        slices = [];
        
        this.buildFloorSlice(slices, height, hallHeight, SliceType.FLOOR_MIDDLE + floorType, SliceType.WALL_MIDDLE + wallType, SliceType.HALL_MIDDLE, SliceType.WINDOW + wallType);

        if (Math.random() < 0.15) {
            var y = height;
            slices.push(new WallSlice(SliceType.DOOR + Util.random(3), y - WallSlice.DOOR_HEIGHT));
        }

        this.addWallSlices(slices);
    }
};

MapBuilder.prototype.addFloorSlice = function(height, hallHeight, floorType, wallType, hallType, windowType) {
    this.addWallSlices(this.buildFloorSlice([], height, hallHeight, floorType, wallType, hallType, windowType));
};

MapBuilder.prototype.buildFloorSlice = function(slices, height, hallHeight, floorType, wallType, hallType, windowType) {
    var windowDecorate = (!!windowType)? 10:0;
    windowType = windowType || wallType;
    var decoration, shouldPlaceWall = true;
    
    var y = height;

    slices.push(new WallSlice(floorType, y));

    for (var i = y + WallSlice.HEIGHT; i < y + MapBuilder.WALL_MAXHEIGHT; i += WallSlice.HEIGHT, shouldPlaceWall = !shouldPlaceWall) {
        if (shouldPlaceWall) {
            slices.push(new WallSlice(wallType,i));
        } else {
            decoration = Util.random(3) * windowDecorate;
            slices.push(new WallSlice(windowType + decoration, i));
        }
    }

    y -= WallSlice.HEIGHT;
    slices.push(new WallSlice(hallType, y));
    y -= WallSlice.HEIGHT;
    slices.push(new WallSlice(hallType + 1, y));
    for (var j = 2; j< hallHeight; j++) {
        y -= WallSlice.HEIGHT;
        slices.push(new Hall3Slice(y, j === hallHeight - 1));
    }

    shouldPlaceWall = true;
    for (i = y - WallSlice.HEIGHT; i >= y - WallSlice.HEIGHT * 15; i -= WallSlice.HEIGHT, shouldPlaceWall = !shouldPlaceWall) {
        if (shouldPlaceWall) {
            slices.push(new WallSlice(wallType,i));
        } else {
            decoration = Util.random(3) * windowDecorate;
            slices.push(new WallSlice(windowType + decoration, i));
        }
    }

    return slices;
};

MapBuilder.prototype.addCraneMid = function(height, spanLength, flipped) {
    var y = height;

    var crane3Index = 0;
    var crane4Index = Math.floor(spanLength * 0.3);
    var crane5Index = Util.random(spanLength - 1, crane4Index + 2);

    if (flipped) {
        crane3Index = spanLength - 2;
        crane4Index = spanLength - crane4Index - 1;
        crane5Index = spanLength - crane5Index - 1;
    }

    for (var i = 0; i < spanLength; i++) {
        var slices = [];

        slices.push(new WallSlice(SliceType.CRANE1_MIDDLE, y, {
            width: WallSlice.CRANE_WIDTH
        }));
        
        if (!flipped && i === crane3Index + 1) {
            slices.push(new WallSlice(SliceType.CRANE3, y + 5, {
                width: WallSlice.CRANE3_WIDTH,
                offsetX: -WallSlice.WIDTH * 3.5,
            }));
        } else if (i === crane4Index + 1) {

            var crane4OffsetX = -WallSlice.CRANE4_WIDTH;

            for (var j = y - 20 + WallSlice.CRANE4_HEIGHT; j < y + MapBuilder.WALL_MAXHEIGHT; j+= WallSlice.CRANE2_HEIGHT) {
                slices.push(new WallSlice(SliceType.CRANE2, j, {
                    width: WallSlice.CRANE2_WIDTH,
                    offsetX: crane4OffsetX + 8,
                }));
            }

            slices.push(new WallSlice(SliceType.ANTENNA + 4, y - WallSlice.ANTENNA_HEIGHT, {offsetX: crane4OffsetX + 8 }));
            
            slices.push(new WallSlice(SliceType.CRANE4, y - 8, {
                width: WallSlice.CRANE4_WIDTH,
                offsetX: crane4OffsetX,
                scale: {
                    x: flipped?-WallSlice.SCALE:WallSlice.SCALE,
                    y: WallSlice.SCALE
                },
                anchor: {
                    x: flipped?1:0,
                    y: 0
                }
            }));

        } else if (i === crane5Index) {
            slices.push(new WallSlice(SliceType.CRANE5, y + WallSlice.HEIGHT * 1.4, {
                width: WallSlice.CRANE5_WIDTH,
                offsetX: -10,
                scale: {
                    x: flipped?WallSlice.SCALE:-WallSlice.SCALE,
                    y: WallSlice.SCALE
                },
                anchor: {
                    x: flipped?0:1,
                    y: 0
                }
            }));
        }
        
        this.addWallSlices(slices);

        this.addWallSlices([new WallSlice(SliceType.GAP)]);
    }
};

MapBuilder.prototype.addCraneSlice = function(height, sliceType, antenna) {
    var antenna = antenna || false;
    var y = height;

    var slices = [];

    slices.push(new WallSlice(sliceType, y, {
        width: WallSlice.CRANE_WIDTH
    }));

    if (antenna) {
        slices.push(new WallSlice(SliceType.ANTENNA + 4, y - WallSlice.ANTENNA_HEIGHT));
    }
    
    this.addWallSlices(slices);
};

MapBuilder.prototype.addCollapseMid = function(height, spanLength, wallType, collapseObject) {
    wallType = wallType || 0;
    var slices;
    
    for (var i = 0; i < spanLength; i++) {
        slices = [];
        
        this.buildWindowedCollapseSlice(slices, height, SliceType.ROOF_MIDDLE_CRACKED + wallType * 8, SliceType.WALL_MIDDLE_CRACKED + wallType * 8, SliceType.WINDOW + wallType, collapseObject);
        
        this.addWallSlices(slices);
    }
};

MapBuilder.prototype.addCollapseSlice = function(height, roofSlice, wallSlice, collapseObject) {
    this.addWallSlices(this.buildCollapseSlice([], height, roofSlice, wallSlice, collapseObject));
};


MapBuilder.prototype.buildCollapseSlice = function(slices, height, roofSlice, wallSlice, collapseObject) {
    var y = height;
    var crackDecoration = Util.random(7);

    slices.push(new CollapseSlice(roofSlice + crackDecoration, y, { collapseObject: collapseObject }));

    for (var i = y + WallSlice.HEIGHT; i< y + MapBuilder.WALL_MAXHEIGHT; i+= WallSlice.HEIGHT) {
        crackDecoration = Util.random(7);
        slices.push(new CollapseSlice(wallSlice + crackDecoration, i, { collapseObject: collapseObject }));
    }
    return slices;
};

MapBuilder.prototype.buildWindowedCollapseSlice = function(slices, height, roofSlice, wallSlice, windowSlice, collapseObject) {
    var windowDecoration, crackDecoration = Util.random(7);
    var y = height;
    var shouldPlaceWall = true;

    slices.push(new CollapseSlice(roofSlice + crackDecoration, y, { collapseObject: collapseObject}));

    for (var i = y + WallSlice.HEIGHT; i < y + MapBuilder.WALL_MAXHEIGHT; i+= WallSlice.HEIGHT, shouldPlaceWall = !shouldPlaceWall) {
        if (shouldPlaceWall) {
            crackDecoration = Util.random(7);
            slices.push(new CollapseSlice(wallSlice + crackDecoration, i, { collapseObject: collapseObject }));
        } else {
            windowDecoration = Util.random(3) * 10;
            slices.push(new CollapseSlice(windowSlice + windowDecoration, i, { collapseObject: collapseObject }));
        }
    }

    return slices;
};

MapBuilder.prototype.addDecorationEscape = function(height) {
    var y = height;
    
    var slices = [];

    for (var i = y + WallSlice.HEIGHT; i < y + MapBuilder.WALL_MAXHEIGHT; i += WallSlice.ESCAPE_HEIGHT) {
        slices.push(new WallSlice(SliceType.ESCAPE, i));
    }

    this.addWallSlices(slices);
};

MapBuilder.prototype.addPigeons = function(height, spanLength) {
    var y = height;
    

    var prevPigeons = new PigeonGroup();
    
    for (var i = 0; i < spanLength; i++) {

        var currentPigeons = new PigeonGroup(y - Pigeon.HEIGHT);

        prevPigeons.nextPigeons = currentPigeons;
        prevPigeons = currentPigeons;
        
        this.pigeons.addSlices([currentPigeons]);
        
        for (var skip = 1; skip < PigeonGroup.WIDTH / WallSlice.WIDTH; skip++, i++) {
            this.pigeons.addSlices([new WallSlice(SliceType.GAP)]);
        }
    }
};

MapBuilder.prototype.addGibs = function(height, spanLength, collapseObject) {
    var slices;
    
    for (var i = 0; i < spanLength; i++) {
        slices = [];
        for (var y = height; y < height + MapBuilder.WALL_MAXHEIGHT; y += WallSlice.HEIGHT) {
            if (Util.percentChance(90)) { continue; }
            slices.push(new GibSlice(SliceType.GIBS + Util.random(5), y, { collapseObject: collapseObject }));
        }
        this.obstacles.addSlices(slices);
    }
};

MapBuilder.prototype.addObstacles = function(height, spanLength, obstacleType, obstacleMax, chance) {
    chance = chance || 1.5;
    var shouldSkip = false;
    
    for (var i = 0; i < spanLength; i++) {
        if (!shouldSkip && i > 1 && i < spanLength - 1 && Util.percentChance(chance)) {
            this.obstacles.addSlices([new ObstacleSlice(obstacleType + Util.random(obstacleMax - 1), height - ObstacleSlice.HEIGHT / 2)]);
            shouldSkip = true;
        } else {
            this.obstacles.addSlices([new WallSlice(SliceType.GAP)]);
            shouldSkip = false;
        }
    }
};

MapBuilder.prototype.addPigeonsOrGap = function(height, spanLength) {
    if (Util.percentChance(70)) {
        this.addPigeons(height, spanLength);
    } else {
        this.addPigeonGap(spanLength);
    }
};

MapBuilder.prototype.addWallGap = function(spanLength) {
    for (var i = 0; i < spanLength; i++) {
        this.addWallSlices([new WallSlice(SliceType.GAP)]);
    }
};

MapBuilder.prototype.addGapButWall = function(spanLength) {
    this.addObstacleGap(spanLength);
    this.addPigeonGap(spanLength);
};

MapBuilder.prototype.addObstacleGap = function(spanLength) {
    for (var i = 0; i < spanLength; i++) {
        this.obstacles.addSlices([new WallSlice(SliceType.GAP)]);
    }
};

MapBuilder.prototype.addPigeonGap = function(spanLength) {
    for (var i = 0; i < spanLength; i++) {
        this.pigeons.addSlices([new WallSlice(SliceType.GAP)]);
    }
};

MapBuilder.prototype.addGlassWindow = function(height, hallHeight, back) {
    var offsetX = (!back)?WallSlice.WIDTH * 0.2:WallSlice.WIDTH * 0.8;
    var y = height;
    var slices = [];

    for (var i = 0; i< hallHeight - 1; i++) {
        y -= WallSlice.HEIGHT;
        slices.push(new GlassWindow(y, offsetX, null));
    }
    y -= WallSlice.HEIGHT;
    slices.push(new GlassWindow(y, offsetX, this.shards));
    
    this.pigeons.addSlices(slices);
};

MapBuilder.prototype.addWallSlices = function(slices, decslices) {
    if (!decslices) {
        decslices = slices.map(function() { return new WallSlice(SliceType.GAP); });
    }

    this.walls.addSlices(slices);
    this.decorations.addSlices(decslices);
};
