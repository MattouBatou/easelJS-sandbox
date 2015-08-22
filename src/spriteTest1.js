var Testing = function() {
  var image = new Image();
  image.src = "assets/sprites/player/botPlayer/sprites.png";

  var stage = new createjs.Stage("stage");

  var data = {
    images: [image],
    frames: { width:128, height:128, count:10, regX:64, regY:64, spacing:0, margin:0 },
    animations:{
      idle: 0,
      walk:[1, 9, true, 0.3]
    }
  };

  var ss = new createjs.SpriteSheet(data);

  var sprite = new createjs.Sprite(ss);
  sprite.gotoAndPlay("walk");

  var sprite2 = new createjs.Sprite(ss);
  sprite2.gotoAndPlay("walk");
  sprite2.x = sprite2.spriteSheet._frameWidth/4;

  var container = new createjs.Container();
  container.addChild(sprite, sprite2);


  // Make sure to round all static coordinate values for crisp pixels.
  // When animating a vector translation it doesn't matter as smoother perceived movement is achieved with sub-pixel movement.
  // However, when the sprite stops moving after a vector translation animation, the vector must be rounded to nearest whole
  // number to avoid sub-pixel rendering.
  // If we can get away with the smallest x,y animation amount of sprites being 1 then we'll do that to always ensure
  // rendering sprites to a whole pixel.
  container.x = 300;
  container.y = Math.floor(window.innerHeight/4);

  stage.addChild(container);

  container.addEventListener("click", handleClick);

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", handleTick);

  var val=0;
  var val2=0;

  function handleTick(e) {
    if (!e.paused) {
      val += 0.01;
      val2+= 0.03;
      container.y = Math.floor(Math.sin(val)*60)+Math.floor(window.innerHeight/4);
      sprite.y = Math.floor(Math.cos(val)*80);
      sprite2.y = Math.floor(Math.cos(val2)*120);
      container.sortChildren(sortFunction);

      container.x += 2;
      if(container.x > Math.floor(window.innerWidth/2)+32)
        container.x = -64;
    }
    stage.update();
  }

  function handleClick(e) {
    console.log(e);
    var hit = e.target.hitTest(e.stageX, e.stageY);
    e.target.y -=1;
    e.target.parent.sortChildren(sortFunction);
    stage.update();
  };

  var sortFunction = function(obj1, obj2, options) {
    if (obj1.y > obj2.y) { return 1; }
    if (obj1.y < obj2.y) { return -1; }
    return 0;
  };

  stage.update();
};

window.onload=function(){ Testing() };