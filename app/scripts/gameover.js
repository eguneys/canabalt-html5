'use strict';

function GameOver(width, height, distance, player) {
    PIXI.DisplayObjectContainer.call(this);
    
    var gameover = 0.01;
    var h = 88;

    var ggg = new PIXI.Graphics();

    ggg.beginFill(0xff35353d);
    ggg.drawRect(0, h+35, width, 64);

    ggg.beginFill(0xfffffff);
    ggg.drawRect(0, h+35+64, width, 2);

    ggg.beginFill(0xff35353d);
    ggg.drawRect(0, height - 30, width, 30);

    this.addChild(ggg);

    var gameover = new PIXI.Sprite.fromFrame('raw/gameover.png');
    gameover.x = Math.floor((width - 390) / 2);
    gameover.y = h;
    
    this.addChild(gameover);

    var epitaph = Util.format('You ran {0}m before ', distance) + player.epitaph;

    var epitaphText = new PIXI.Text(epitaph,
                                    {
                                        font: '16px Flixel',
                                        fill: '#ffffff',
                                        align: 'center',
                                        wordWrap: true,
                                        wordWrapWidth: width
                                    });

    epitaphText.x = Math.floor((width - 390 + 100) / 2);
    epitaphText.y = h + 50;
    epitaphText.width = width;
    epitaphText.scale.x = 1;
    epitaphText.scale.y = 1;
    
    this.addChild(epitaphText);


    var t = new PIXI.Text('Jump to retry your daring escape.',
                         {
                             font: '16px Flixel',
                             fill: '#ffffff',
                             align: 'right',
                         });
    t.x = 0;
    t.y = height - 27;
    
    this.addChild(t);
};

GameOver.constructor = GameOver;
GameOver.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
