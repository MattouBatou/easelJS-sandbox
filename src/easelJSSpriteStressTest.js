var TILEMAP_PATH = "assets/tilemaps/";

var Testing = function (Level)
{
  var stage = new createjs.Stage("stage");
  var stageContext = stage.canvas.getContext("2d");
  stageContext.imageSmoothingEnabled = false;
  // Stop the whole canvas from autoclearing every frame. Keep set to false to allow us to manually layer
  // raw canvas drawing with EaselJS DisplayObjects, i.e. our non-Easel Tilemap with Easel Sprites.
  //stage.autoClear = false;

// PLACEHOLDER ENGINE VARS
  // Level default values
  var Level = {
    id: "level1"
  };

 //var tilemap = new Tilemap(stage, stageContext, TILEMAP_PATH, "/bvb-sandbox-small.json", Level.id, stage.canvas.width, stage.canvas.height);

  console.log(stage);

  var spritesContainer = new createjs.Container();
  stage.addChild(spritesContainer);

// SPRITES
  var sprite1Image = new Image();
  sprite1Image.src = "assets/sprites/player/botPlayer/sprites.png";
  var data = {
    images: [sprite1Image],
    frames: {width: 128, height: 128, count: 10, regX: 64, regY: 64, spacing: 0, margin: 0},
    animations: {
      idle: 0,
      walk: [1, 9, true, 0.3]
    }
  };
  sprite1Image.onload = function()
  {
    var ss = new createjs.SpriteSheet(data);
    var spriteCount = 350;
    for(var i=0; i < spriteCount; i++)
    {
      var sprite = new createjs.Sprite(ss);
      sprite.gotoAndPlay("walk");
      sprite.x = getRandomArbitrary(0, 1600)|0;
      sprite.y = getRandomArbitrary(0, 1600)|0;
      spritesContainer.addChild(sprite);
    }
  };

  var val = 0;
  var val2 = 0;

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", handleTick);

  var x = 0;
  var y = 0;

  function handleTick(e)
  {
    if (!e.paused)
    {
      val += 0.01;
      val2 += 0.03;
      y -= Math.sin(val*1.5)*10;
      x -= Math.sin(val2*1.5)*20;
      stage.x = x;
      stage.y = y;
      //stageContext.clearRect(-x, -y, stage.canvas.width, stage.canvas.height);


      //container.y = ( (Math.sin(val)*60)+Math.floor(stage.canvas.height/2))|0;
      // sprite.y = (Math.cos(val)*80)|0;
      // sprite2.y = (Math.cos(val2)*120)|0;
      // container.sortChildren(sortFunction);

      //container.x += 2;
      //if(container.x > Math.floor(stage.canvas.width)+32)
      //  container.x = -64;


      //tilemap.update(null, stageContext);

      stage.update();
      //stageContext.drawImageInstanced(PARTICLES, buffer,  _rects, _rects, _mat32Buffer );
      /*stageContext.setTransform(1, 0, 0, 1, 0, 0);
      stageContext.colorShader = 0;*/
    }
  }

  stage.update();
};


window.onload = function (Level) { Testing(Level) };