var proceduralTexture=function(offCanvas, ctx, shader, rgb, scaleXY, texPattern){
  ctx.clearRect(0,0, offCanvas.width, offCanvas.height);
  ctx.colorShader = shader;
  ctx.setPixelUniformFloat(0, rgb[0], rgb[1], rgb[2]); // first arg is the layout(binding) for the GX2 API, then RGB
  ctx.setPixelUniformFloat(3, scaleXY[0], scaleXY[1]); // first arg is the layout(binding) for the GX2 API, then fill scale x,y
  ctx.setPixelUniformFloat(5, texPattern); // first arg is the layout(binding) for the GX2 API, then texture fill type
  ctx.fillRect(0, 0, 50, 50);
  ctx.colorShader = 0;
  var tex = offCanvas.toDataURL("image/png"); // grab image before canvas is cleared
  return tex;
};

var Testing = function() {
  var image = new Image();
  image.src = "assets/sprites/player/botPlayer/sprites.png";

  var stage = new createjs.Stage("stage");
  stage.snapToPixel = false;
  console.log(stage);

  var ctx = stage.canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  console.log(ctx);

  var buffer = document.createElement('canvas');
  buffer.width = 10;
  buffer.height = 10;
  var buffer_ctx = buffer.getContext('2d');

  buffer_ctx.clearRect(0,0, 10, 10);
  buffer_ctx.fillStyle = "white";
  buffer_ctx.fillRect(0,0, 10, 10);

  if(buffer_ctx.loadShader)// shader extension to context2d are not added in Chrome
    var fillShader = buffer_ctx.loadShader("assets/shaders/precompiled/proceduralTexture-Hullbreach/fillRectProcTex.gsh");
  else
    var fillShader = 0;

  //proceduralTexture(buffer, buffer_ctx, fillShader, [getRandomArbitrary(0.0,2.0),getRandomArbitrary(0.0,2.0),getRandomArbitrary(0.0,2.0)], [getRandomArbitrary(0.0,2.0), getRandomArbitrary(0.0,2.0)], Math.abs(Math.floor(getRandomArbitrary(1,8))) );

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
  sprite2.x = sprite2.spriteSheet._frameWidth/4|0;
  sprite2.y = -101|0;
  var container = new createjs.Container();
  container.addChild(sprite, sprite2);

  var PARTICLES = 2000;

  var _mat32Buffer = new Float32Array( 6 * PARTICLES );
  var _rects    = new Float32Array( 4 * PARTICLES );
  var _alphaBuffer = new Float32Array( 4 * PARTICLES );


  // SAVE: 500 Bitmap images added to an Easel container.
  /*for(var i=0; i<500; i++) {
    var img = proceduralTexture(buffer, buffer_ctx, fillShader, [getRandomArbitrary(0.0,2.0),getRandomArbitrary(0.0,2.0),getRandomArbitrary(0.0,2.0)], [getRandomArbitrary(0.0,2.0), getRandomArbitrary(0.0,2.0)], Math.abs(Math.floor(getRandomArbitrary(1,8))) );

    var canvasSprite = new createjs.Bitmap(img);
    canvasSprite.x = Math.floor(getRandomArbitrary(1,stage.canvas.width))-300;
    canvasSprite.y = Math.floor(getRandomArbitrary(1,stage.canvas.height))-(stage.canvas.height/2);
    container.children.push(canvasSprite);
  }*/


  // Make sure to round all static coordinate values for crisp pixels.
  // When animating a vector translation it doesn't matter as smoother perceived movement is achieved with sub-pixel movement.
  // However, when the sprite stops moving after a vector translation animation, the vector must be rounded to nearest whole
  // number to avoid sub-pixel rendering.
  // If we can get away with the smallest x,y animation amount of sprites being 1 then we'll do that to always ensure
  // rendering sprites to a whole pixel.
  container.x = 300;
  container.y = Math.floor(stage.canvas.height/2);

  stage.addChild(container);
  console.log(container);
  container.addEventListener("click", handleClick);

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener("tick", handleTick);

  var val=0;
  var val2=0;

  var particleX=0;
  var particleY=0;

  function handleTick(e) {
    if (!e.paused) {
      stage.update();

      val += 0.01;
      val2+= 0.03;
      container.y = ( (Math.sin(val)*60)+Math.floor(stage.canvas.height/2))|0;
      sprite.y = (Math.cos(val)*80)|0;
      sprite2.y = (Math.cos(val2)*120)|0;
      container.sortChildren(sortFunction);

      container.x += 2;
      if(container.x > Math.floor(stage.canvas.width)+32)
        container.x = -64;

      for (var i = 0; i < PARTICLES; i++) {
        particleX = ( (i/getRandomArbitrary(0, 10))+Math.cos(val2)*80 )|0;
        particleY = ( (i/getRandomArbitrary(0, 10))+Math.cos(val)*160 )|0;

        // set source and destination rects
        _rects[ i * 4 + 0 ] = 0;
        _rects[ i * 4 + 1 ] = 0;
        _rects[ i * 4 + 2 ] = 10;
        _rects[ i * 4 + 3 ] = 10;

        // move particles ( x, y ) only
        _mat32Buffer[ i * 6 + 0 ] = 1;
        _mat32Buffer[ i * 6 + 3 ] = 1;
        _mat32Buffer[ i * 6 + 4 ] = particleX;
        _mat32Buffer[ i * 6 + 5 ] = particleY;

        // alpha and color
        _alphaBuffer[ i * 4 + 0] = Math.random() * 0.7 + 0.3;
        _alphaBuffer[ i * 4 + 1] = Math.random() * 0.7 + 0.3;
        _alphaBuffer[ i * 4 + 2] = Math.random() * 0.7 + 0.3;
        _alphaBuffer[ i * 4 + 3] = Math.random() * (0.7 - 0.3 + 1) + 0.3;
      }

      //proceduralTexture(buffer, buffer_ctx, fillShader, [getRandomArbitrary(0.0,2.0),getRandomArbitrary(0.0,2.0),getRandomArbitrary(0.0,2.0)], [2.0,2.0], Math.abs((getRandomArbitrary(1,8)))|0 );
      ctx.drawImageInstanced(PARTICLES, buffer,  _rects, _rects, _mat32Buffer, _alphaBuffer);

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.colorShader = 0;
    }
  }

  function handleClick(e) {
    console.log(e);
    var hit = e.target.hitTest(e.stageX, e.stageY);
    e.target.x-=10;
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

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

CanvasRenderingContext2D.prototype.drawImageInstanced = function drawImageInstanced(count, img, sourceRects, destRects, matrix32s, color) {
  // TODO: finish this polyfill
  var i = 0;
  for (i; i < count; i++) {

    this.save();

    this.transform(
      matrix32s[ i * 6 + 0 ], matrix32s[ i * 6 + 1 ],
      matrix32s[ i * 6 + 2 ], matrix32s[ i * 6 + 3 ],
      matrix32s[ i * 6 + 4 ], matrix32s[ i * 6 + 5 ]
    );

    if(color) {
      /*this.clearRect(sourceRects[i * 2 + 0], sourceRects[i * 2 + 1], sourceRects[i * 2 + 2], sourceRects[i * 2 + 3]);
      this.fillStyle = "rgba("+color[i * 4 + 0]+","+color[i * 4 + 1]+","+color[i * 4 + 2]+","+color[i * 4 + 3]+")";
      this.fillRect(sourceRects[i * 2 + 0], sourceRects[i * 2 + 1], sourceRects[i * 2 + 2], sourceRects[i * 2 + 3]);*/
      this.globalAlpha = color[i * 4 + 3]
    }
    else {
      this.globalAlpha = 1.0;
    }

    // this was based of the old spec so needs to be redone

    // Matthew Lewis Polyfill addition
    this.drawImage(img,
      destRects[i * 2 + 0],
      destRects[i * 2 + 1],
      destRects[i * 2 + 2],
      destRects[i * 2 + 3],
      sourceRects[i * 2 + 0],
      sourceRects[i * 2 + 1],
      sourceRects[i * 2 + 2],
      sourceRects[i * 2 + 3]
    );


    this.restore();
  }
  return null;
};

window.onload=function(){ Testing() };