'use strict';

function WallSlice(type, y, options) {
    this.type = type;
    this.y = y;
    this.sprite = null;

    var defaults = {
        width: WallSlice.WIDTH,
        offsetX: 0,
        scale: {
            x: WallSlice.SCALE,
            y: WallSlice.SCALE
        },
        anchor: {
            x: 0,
            y: 0
        }
    };

    options = options || defaults;

    this.options = $.extend({}, defaults, options);
    
    this.width = this.options.width;
    this.offsetX = this.options.offsetX;
    this.scale = this.options.scale;
    this.anchor = this.options.anchor;
}

WallSlice.prototype.initDisplay = function(offset, index, y) {
    this.sprite = GameGlobal.PoolKeeper.borrowWallSprite(this.type);
    
    this.sprite.scale.x = this.scale.x;
    this.sprite.scale.y = this.scale.y;

    this.sprite.anchor = this.anchor;
    
    this.sprite.position.x = offset + (index * WallSlice.WIDTH) + this.offsetX;
    this.sprite.position.y = this.y + y;
};

WallSlice.prototype.updateDisplay = function(offset, index, y) {
    this.sprite.position.x = offset + (index * WallSlice.WIDTH)+ this.offsetX;

    this.sprite.position.y = this.y + y;
};

WallSlice.prototype.removeDisplay = function() {
    GameGlobal.PoolKeeper.returnWallSprite(this.type, this.sprite);
    this.sprite = null;
};

WallSlice.prototype.checkCollision = function(player, shards) {
    var hitRoof = this.type < SliceType.WALL_RIGHT;
    var hitFloor = this.type >= SliceType.FLOOR_LEFT && this.type <= SliceType.FLOOR_RIGHT + 2;
    var hitCrane = this.type >= SliceType.CRANE1_LEFT && this.type <= SliceType.CRANE1_RIGHT;

    var hitWallLeft = this.type >= SliceType.WALL_LEFT && this.type < SliceType.WALL_LEFT + 5;
    
    var xdist;

    if (hitRoof || hitFloor || hitCrane || hitWallLeft) {
        if (player.position.y >= this.sprite.position.y - player.height && player.position.y <= this.sprite.position.y + this.sprite.height) {
            xdist = player.position.x - this.sprite.position.x;
            if (xdist > 0 && xdist < this.width) {
                if (hitWallLeft) {
                    player.hitLeft(this.sprite.position.x - player.width + 5);
                } else {
                    player.hitBottom(this.sprite.position.y - player.height);
                }
                if (hitCrane) {
                    player.craneFeet = true;
                }
            }
        }


        if (shards && shards.animationTime > 0) {
            shards.shards.forEach(function(shard) {
                if (shard.sprite.position.y > this.sprite.position.y - shard.sprite.height / 10) {
                    xdist = shard.sprite.position.x - this.sprite.position.x;
                    if (xdist > 0 && xdist < this.width) {
                        if (hitWallLeft) {
                            // shard.hitLeft(this.sprite.position.x - shard.sprite.width / 10);
                        } else {
                            shard.hitBottom(this.sprite.position.y - shard.sprite.height / 10);
                        }
                    }
                }
            }, this);
        }
    }
};


WallSlice.SCALE = 1;

WallSlice.WIDTH = 16 * WallSlice.SCALE;
WallSlice.HEIGHT = 16 * WallSlice.SCALE;

WallSlice.CRANE_HEIGHT = 32 * WallSlice.SCALE;
WallSlice.CRANE_WIDTH = 32 * WallSlice.SCALE;

WallSlice.CRANE2_HEIGHT = 30 * WallSlice.SCALE;

WallSlice.CRANE3_WIDTH = 64 * WallSlice.SCALE;

WallSlice.CRANE4_HEIGHT = 48 * WallSlice.SCALE;
WallSlice.CRANE4_WIDTH = 48 * WallSlice.SCALE;

WallSlice.SLOPE_HEIGHT = 15 * WallSlice.SCALE;
WallSlice.SLOPE_WIDTH = 16 * WallSlice.SCALE;

WallSlice.FENCE_HEIGHT = 32 * WallSlice.SCALE;
WallSlice.PIPE1_HEIGHT = 20 * WallSlice.SCALE;
WallSlice.PIPE2_HEIGHT = 40 * WallSlice.SCALE;
WallSlice.PIPE2_WIDTH = 40 * WallSlice.SCALE;

WallSlice.RESERVOIR_HEIGHT = 120 * WallSlice.SCALE;
WallSlice.RESERVOIR_WIDTH = 80 * WallSlice.SCALE;


WallSlice.ANTENNA_HEIGHT =  160 * WallSlice.SCALE;
WallSlice.ANTENNA_WIDTH = 40 * WallSlice.SCALE;

WallSlice.SKYLIGHT_HEIGHT = 20 * WallSlice.SCALE;
WallSlice.SKYLIGHT_WIDTH = 80 * WallSlice.SCALE;

WallSlice.ACCESS_HEIGHT = 30 * WallSlice.SCALE;
WallSlice.ACCESS_WIDTH = 60 * WallSlice.SCALE;

WallSlice.AC_HEIGHT = 20 * WallSlice.SCALE;
WallSlice.AC_WIDTH = 20 * WallSlice.SCALE;

WallSlice.ESCAPE_HEIGHT = 32 * WallSlice.SCALE;

WallSlice.DOOR_HEIGHT = 24 * WallSlice.SCALE;

function SliceType() {}

SliceType.ROOF_RIGHT = 0;
SliceType.ROOF_MIDDLE = 5;
SliceType.ROOF_LEFT = 10;
SliceType.WALL_RIGHT = 15;
SliceType.WALL_MIDDLE = 20;
SliceType.WALL_LEFT = 25;

SliceType.FLOOR_LEFT = 30;
SliceType.FLOOR_MIDDLE = 35;
SliceType.FLOOR_RIGHT = 40;

SliceType.HALL_LEFT = 45;
SliceType.HALL_MIDDLE = 50;
SliceType.HALL_RIGHT = 55;

SliceType.CRANE1_LEFT = 60;
SliceType.CRANE1_MIDDLE = 61;
SliceType.CRANE1_RIGHT = 62;

SliceType.CRANE2 = 63;
SliceType.CRANE3 = 64;
SliceType.CRANE4 = 65;
SliceType.CRANE5 = 66;

SliceType.WINDOW = 67; // 80, 90, 100

SliceType.FENCE = 110;

SliceType.SLOPE_RIGHT = 111;
SliceType.SLOPE_MIDDLE = 112;
SliceType.SLOPE_LEFT = 113;

SliceType.PIPE1_RIGHT = 114;
SliceType.PIPE1_MIDDLE = 115;
SliceType.PIPE1_LEFT = 116;

SliceType.PIPE2 = 117;

SliceType.RESERVOIR = 118;

SliceType.ANTENNA = 119; // 119..126

SliceType.AC = 127;
SliceType.SKYLIGHT = 128;
SliceType.ACCESS = 129;

SliceType.ESCAPE = 130;

SliceType.GIRDER2 = 131;
SliceType.BLOCK = 132;

SliceType.PIGEON = 133;

SliceType.GLASS = 135; // 185

SliceType.GLASSWINDOW = 189;

SliceType.DOOR = 190;

SliceType.GAP = 195;

SliceType.GIBS = 200;

SliceType.GIBS_DUST1 = 203;
SliceType.GIBS_DUST2 = 204;

SliceType.OBSTACLES = 210;
SliceType.OBSTACLES2 = 215;

SliceType.ROOF_RIGHT_CRACKED = 220; // 260
SliceType.ROOF_MIDDLE_CRACKED = 270;
SliceType.ROOF_LEFT_CRACKED = 320;
SliceType.WALL_RIGHT_CRACKED = 370;
SliceType.WALL_MIDDLE_CRACKED = 420;
SliceType.WALL_LEFT_CRACKED = 470; // 510

SliceType.SMOKE = 520;
SliceType.WALKER = 521;
SliceType.BOMB = 522;
SliceType.JET = 523;

SliceType.HALL3 = 524;
