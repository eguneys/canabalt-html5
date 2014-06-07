'use strict';
/* exported Util */

var Util = {
    format: function(str, param) {
        return str.replace('{0}', param);
    },

    random: function(max, min) {
        min = min || 0;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    percentChance: function(percent) {
        return Util.random(100) < percent;
    },

    randomSign: function() {
        return (Math.random() < 0.5)?1:-1;
    }
};


function ObjectPhysics(options) {
    var defaults = {
        position: { x: 0, y: 0},
        deltaPos: { x: 0, y: 0},
        maxVelocity: { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0},
        rotation: 0,
        angularVelocity: 0
    };

    options = options || defaults;

    //this.options = $.extend({}, defaults, options);
    $.extend(this, defaults, options);
}


ObjectPhysics.prototype.update = function() {
    var deltaTime = GameGlobal.TimeKeeper.elapsed * 0.001;

    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;


    this.velocity.x = Math.min(this.velocity.x, this.maxVelocity.x);
    this.velocity.y = Math.min(this.velocity.y, this.maxVelocity.y);
    
    this.deltaPos.x = this.velocity.x * deltaTime;
    this.deltaPos.y = this.velocity.y * deltaTime;

    this.position.x += this.deltaPos.x;
    this.position.y += this.deltaPos.y;
    
    this.rotation += this.angularVelocity * deltaTime;
};
