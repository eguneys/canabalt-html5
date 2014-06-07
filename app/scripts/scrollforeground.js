'use strict';

function ScrollForeground(sliceWidth, screenWidth) {
    PIXI.DisplayObjectContainer.call(this);

    this.slices = [];

    this.viewportX = 0;
    this.viewportY = 0;
    this.viewportSliceX = 0;

    this.SLICE_WIDTH = sliceWidth;
    this.SCREEN_WIDTH = screenWidth;
    
    this.VIEWPORT_NUM_SLICES = Math.ceil(ScrollForeground.VIEWPORT_WIDTH/this.SCREEN_WIDTH) + 1;

    this.setViewportX = function(newViewportX, newViewportY) {
        this.viewportX = this.checkViewportXBounds(newViewportX);

        this.viewportY = newViewportY;

        var prevViewportSliceX = this.viewportSliceX;
        this.viewportSliceX = Math.floor(this.viewportX/this.SLICE_WIDTH);
        
        this.removeOldSlices(prevViewportSliceX);
        this.addNewSlices();
    };
}


ScrollForeground.VIEWPORT_WIDTH = 1256;
ScrollForeground.VIEWPORT_HEIGHT = 512;

ScrollForeground.constructor = ScrollForeground;
ScrollForeground.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);


ScrollForeground.prototype.checkViewportXBounds = function(viewportX) {
    var maxViewportX = (this.slices.length - this.VIEWPORT_NUM_SLICES) * this.SLICE_WIDTH;

    if (viewportX < 0) {
        viewportX = 0;
    } else if(viewportX >= maxViewportX) {
        viewportX = maxViewportX;
    }
    return viewportX;
};

ScrollForeground.prototype.shouldAddSlices = function() {
    return this.slices.length < this.viewportSliceX + this.VIEWPORT_NUM_SLICES + 1;
};

ScrollForeground.prototype.addSlices = function(sliceTypes) {
    this.slices.push(sliceTypes);
};

ScrollForeground.prototype.removeOldSlices = function(prevViewportSliceX) {
    var numOldSlices = this.viewportSliceX - prevViewportSliceX;
    
    if (numOldSlices > this.VIEWPORT_NUM_SLICES) {
        numOldSlices = this.VIEWPORT_NUM_SLICES;
    }

    for (var i = prevViewportSliceX; i < prevViewportSliceX + numOldSlices; i++) {
        var sliceArray = this.slices[i];

        for (var s = 0; s < sliceArray.length; s++) {
            var slice = sliceArray[s];
	    
            if (slice.sprite !== null) {

                this.removeChild(slice.sprite);

                slice.removeDisplay();
            }
        }
    }
};

ScrollForeground.prototype.addNewSlices = function() {

    var firstX = -(this.viewportX % this.SLICE_WIDTH);
    
    for (var i = this.viewportSliceX, sliceIndex = 0;
         i < this.viewportSliceX + this.VIEWPORT_NUM_SLICES;
         i++, sliceIndex++) {

        var sliceArray = this.slices[i];
        for (var s = 0; s < sliceArray.length; s++) {

            var slice = sliceArray[s];
            
            if (slice.sprite === null && slice.type !== SliceType.GAP) {
                // Associate the slice with a sprite and update the sprite's position

                slice.initDisplay(firstX, sliceIndex, this.viewportY);
                this.addChild(slice.sprite);


            } else if (slice.sprite !== null) {
                // The slice is already associated with a sprite. Just update its position.
                slice.updateDisplay(firstX, sliceIndex, this.viewportY);

                slice.checkCollision(this.player, this.shards);
            }
        }
    }
};

ScrollForeground.prototype.setPlayer = function(player) {
    this.player = player;
};

ScrollForeground.prototype.setShards = function(shards) {
    this.shards = shards;
};


function ScrollBackground(image, deltaX, deltaY, offsetY) {
    offsetY = offsetY || 0;
    
    var texture = PIXI.Texture.fromFrame(image);
    PIXI.TilingSprite.call(this, texture, 1024, 256);
    
    this.position.x = 0;
    this.position.y = 0;
    this.tilePosition.x = 0;
    this.tilePosition.y = 0;

    this.scale.x = WallSlice.SCALE;
    this.scale.y = WallSlice.SCALE;

    this.DELTA_X = deltaX;
    this.DELTA_Y = deltaY;

    this.offsetY = offsetY;

    this.viewportX = 0;
    
    this.update = function() {
	
    };

    this.setViewportX = function(newViewportX, newViewportY) {
        var distanceTravelled = newViewportX - this.viewportX;
        this.viewportX = newViewportX;
        this.tilePosition.x += (distanceTravelled * this.DELTA_X);
        this.position.y = this.offsetY + Math.floor(newViewportY * this.DELTA_Y);
    };

}

ScrollBackground.constructor = ScrollBackground;
ScrollBackground.prototype = Object.create(PIXI.TilingSprite.prototype);
