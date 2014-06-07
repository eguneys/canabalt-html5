'use strict';

function DecoratorInfo(height, length, startOffset) {
    this.height = height;
    this.length = length;
    this.startOffset = startOffset;
}

function MapDecorator(chances) {
    this.layerIndex = 0;
    this.layers = [];

    this.chances = chances || {
        slope: 0.2,
        pipe1: 0.35 / 15,
        pipe2: 0.35 / 10,
        reservoir: 0.5 / 15,
        antenna: 0.3 / 5,
        ac: 0.3 / 5,
        access: 0.25 / 15,
        skylight: 0.5 / 15
    };

    this.addAC = true;
    this.addFence = 0.4;
    this.addSlope = true;
    this.addPipes = true;
    this.addConstruction = 0.5;
}


MapDecorator.prototype.buildDecoration = function(height, length) {
    this.layerIndex = 0;

    var decoratorInfo = new DecoratorInfo(height, length, 0);

    if (this.addSlope) {
        this.addSlopeLayer(decoratorInfo, Util.random(4));
    }

    if (this.addAC) {
        decoratorInfo.height -= WallSlice.AC_HEIGHT;
        this.addRandomLayer(SliceType.AC, decoratorInfo, false, this.chances.ac);
        decoratorInfo.height += WallSlice.AC_HEIGHT;
    }

    if (Math.random() < 0.5) {
    
        if (this.addPipes) {
            this.addPipeLayer(decoratorInfo);
        }

        if (Math.random() < this.addConstruction) {
            this.addBigSpriteRandomLayer(decoratorInfo, SliceType.ANTENNA + Util.random(6, 1), WallSlice.ANTENNA_HEIGHT, WallSlice.ANTENNA_WIDTH, this.chances.antenna);
        }

    } else {

        this.addReservoirLayer(decoratorInfo);
        
        if (Math.random() < this.addFence) {
            decoratorInfo.height -=  WallSlice.FENCE_HEIGHT;
            this.addLayer(SliceType.FENCE, decoratorInfo, true);
            decoratorInfo.height += WallSlice.FENCE_HEIGHT;
        }
    }
    
};

MapDecorator.prototype.addReservoirLayer = function(dinfo) {
    this.addBigSpriteRandomLayer(dinfo, SliceType.SKYLIGHT, WallSlice.SKYLIGHT_HEIGHT, WallSlice.SKYLIGHT_WIDTH, this.chances.skylight);
    this.addBigSpriteRandomLayer(dinfo, SliceType.ACCESS, WallSlice.ACCESS_HEIGHT, WallSlice.ACCESS_WIDTH, this.chances.access);
    this.addBigSpriteRandomLayer(dinfo, SliceType.RESERVOIR, WallSlice.RESERVOIR_HEIGHT, WallSlice.RESERVOIR_WIDTH, this.chances.reservoir);
};

MapDecorator.prototype.addPipeLayer = function(dinfo) {
    var pipe1dinfo = new DecoratorInfo(dinfo.height - WallSlice.PIPE1_HEIGHT, dinfo.length, dinfo.startOffset);
    this.addRandomLayer3Type(SliceType.PIPE1_LEFT, SliceType.PIPE1_MIDDLE, SliceType.PIPE1_RIGHT, pipe1dinfo, 0, this.chances.pipe1);

    this.addBigSpriteRandomLayer(dinfo, SliceType.PIPE2, WallSlice.PIPE2_HEIGHT, WallSlice.PIPE2_WIDTH, this.chances.pipe2);
};

MapDecorator.prototype.addSlopeLayer = function(dinfo, amount) {
    for (var i = 0; i < amount; i++) {
        dinfo.height -= WallSlice.SLOPE_HEIGHT;
        dinfo.startOffset = i;
        
        this.addLayer3Type(SliceType.SLOPE_LEFT, SliceType.SLOPE_MIDDLE, SliceType.SLOPE_RIGHT, dinfo);
        dinfo.length -= 1;
    }
    dinfo.length -= 2;
};

MapDecorator.prototype.addBigSpriteRandomLayer = function(dinfo, type, height, width, chance) {
    var spriteIndexSkip = Math.floor(width / WallSlice.WIDTH);

    var spritedinfo = new DecoratorInfo(dinfo.height - height, dinfo.length - spriteIndexSkip, dinfo.startOffset);
    
    this.addRandomLayer(type, spritedinfo, spriteIndexSkip, chance);
};


MapDecorator.prototype.addRandomLayer3Type = function(beginType, middleType, endType, dinfo, skipCount, addChance) {
    var addOneNow = false, randomLength = 0;
    
    this.layers[this.layerIndex] = [];

    for (var i = 0; i < dinfo.startOffset; i++) {
        this.layers[this.layerIndex].push(null);
    }

    for (i = dinfo.startOffset; i < dinfo.length; i++) {
        addOneNow = Math.random() < addChance;
        
        if (addOneNow) {
            randomLength = Util.random(15, 1);

            this.layers[this.layerIndex].push(new WallSlice(beginType, dinfo.height));
            i++;
            
            for (var j = 0; j < randomLength && i < dinfo.length; i++, j++) {
                this.layers[this.layerIndex].push(new WallSlice(middleType, dinfo.height));
            }
            
            this.layers[this.layerIndex].push(new WallSlice(endType, dinfo.height));
            i++;
            
            // skip some
            for (j = 0; j < skipCount && i < dinfo.length; j++, i++) {
                this.layers[this.layerIndex].push(null);
            }
        } else {
            this.layers[this.layerIndex].push(null);
        }
    }
    
    this.layerIndex++;
};

MapDecorator.prototype.addRandomLayer = function(type, dinfo, skipCount, chance) {
    var addOneNow = false;
    
    this.layers[this.layerIndex] = [];

    for (var i = 0; i < dinfo.startOffset; i++) {
        this.layers[this.layerIndex].push(null);
    }

    for (i = dinfo.startOffset; i < dinfo.length; i++) {
        addOneNow = Math.random() < chance;
        
        if (addOneNow) {
            this.layers[this.layerIndex].push(new WallSlice(type, dinfo.height));

            // skip some
            for (var j = 0; j < skipCount && i < dinfo.length; j++, i++) {
                this.layers[this.layerIndex].push(null);
            }
        } else {
            this.layers[this.layerIndex].push(null);
        }
    }
    
    this.layerIndex++;
};

MapDecorator.prototype.addLayer3Type = function(beginType, middleType, endType, dinfo) {

    this.layers[this.layerIndex] = [];

    for (var i = 0; i < dinfo.startOffset; i++) {
        this.layers[this.layerIndex].push(null);
    }

    this.layers[this.layerIndex].push(new WallSlice(beginType, dinfo.height));
    dinfo.startOffset++;
    
    for (i = dinfo.startOffset; i < dinfo.length - 1; i++) {
        this.layers[this.layerIndex].push(new WallSlice(middleType, dinfo.height));
    }

    this.layers[this.layerIndex].push(new WallSlice(endType, dinfo.height));

    this.layerIndex++;
    
};

MapDecorator.prototype.addLayer = function(type, dinfo, skipOne) {
    skipOne = skipOne || false;

    this.layers[this.layerIndex] = [];

    for (var i = 0; i < dinfo.startOffset; i++) {
        this.layers[this.layerIndex].push(null);
    }
    
    for (i = dinfo.startOffset; i < dinfo.length; i++) {
        if (skipOne && i % 2 === 1) {
            this.layers[this.layerIndex].push(null);
        } else {
            this.layers[this.layerIndex].push(new WallSlice(type, dinfo.height));
        }
    }

    this.layerIndex++;
};

MapDecorator.prototype.addPigeonGroupLayer = function(dinfo) {
    var skipCount = 20;
    
    this.layers[this.layerIndex] = [];

    for (var i = 0; i < dinfo.startOffset; i++) {
        this.layers[this.layerIndex].push(null);
    }

    for (i = dinfo.startOffset; i < dinfo.length; i++) {
        this.layers[this.layerIndex].push(new PigeonGroup(dinfo.height));
        
        // skip some
        for (var j = 0; j < skipCount && i < dinfo.length; j++, i++) {
            this.layers[this.layerIndex].push(null);
        }
    }
    this.layerIndex++;
};

MapDecorator.prototype.addDecorationSlices = function(slices, i) {
    for (var layerIndex = 0; layerIndex < this.layerIndex; layerIndex++) {
        var slice = this.layers[layerIndex][i];
        if (!!slice) {
            slices.push(slice);
        }
    }

};
