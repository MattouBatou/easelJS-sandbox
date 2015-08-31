/**
 * @author       Matthew Lewis <mel_long@live.com>
 * @copyright    2015 Matthew Lewis.
 */

/**
 * @class Tilemap
 * @constructor
 * @param {object}  stageContext       - Stage canvas 2d context object.
 * @param {string}  TILEMAP_PATH       - Path to tilemap assets folder.
 * @param {string}  tiledJson          - Path to Tiled Editor JSON file.
 * @param {string}  levelId            - Id or name of level. e.g. "level1".
 */
var Tilemap = function (stage, stageContext, TILEMAP_PATH, tiledJson, levelId, worldWidth, worldHeight)
{
  /**
   * @property {number} worldWidth - width of the world in pixels. This will mostly be updated with level width.
   */
  this.worldWidth = worldWidth;
  /**
   * @property {number} worldHeight - height of the world in pixels. This will mostly be updated with level height.
   */
  this.worldHeight = worldHeight;

  // Grab Tiled Editor Json file.
  var jsonFile = TILEMAP_PATH+levelId+tiledJson;

  // Create JSON object.
  var tiledMap = this.tiledJsonParser(jsonFile, levelId, true);
  console.log(tiledMap);


  /**
   * @property {object} map2d - Contains all processed and updated map information for the level.
   */
  this.map2d = this.createMap2d(tiledMap);
  console.log(this.map2d);


  /**
   * @property {object} - Contains tileset data and array for the 2d map of tileset tiles.
   */
  this.tilesetMap2d = this.tilesetLoader(stage, stageContext, ( TILEMAP_PATH+levelId+"/" ));
};


/*
 * Parse Tiled JSON string to JSON object and setup Tilemap properties.
 *
 * @method  Tilemap.tiledJsonParser
 * @param   {string} jsonFile - Path to the JSON file to load
 * @param   {string} levelId - Id or name of level e.g. "level1". Set as name for parsed JSON object.
 * @param   {boolean} async - Sets whether to load the JSON file asynchronously or synchronously.
 * @return  {object} mapData - Tiled Editor parsed JSON object.
 */
Tilemap.prototype.tiledJsonParser = function (jsonFile, levelId, async)
{
  // Load Tiled Editor JSON file.
  loadJSON(jsonFile, levelId, async);
  // Parse JSON string to an object.
  var mapData = JSON.parse(localStorage.getItem(levelId));

  // TODO(matt): Copy mapData to main properties of Tilemap here.

  return mapData;
};


/*
 * Create 2d map array from Tiled Editor's one-dimensional array.
 * @method Tilemap.createMap2d
 * @param {object} tiledMap - EaselJS Stage canvas context.
 */
Tilemap.prototype.createMap2d = function (tiledMap)
{
  // We have to manually grab the values from tiledMap object so we can keep it as a reference.
  var map2d = {
    /**
     * @property {number} width - Width of level in number of tiles.
     */
    width: tiledMap.width,
    /**
     * @property {number} height - Height of level in number of tiles.
     */
    height: tiledMap.height,
    /**
     * @property {number} tilewidth - Width of a single tile in pixels.
     */
    tilewidth: tiledMap.tilewidth,
    /**
     * @property {number} tileheight - Height of a single tile in pixels.
     */
    tileheight: tiledMap.tileheight,
    /**
     * @property {array} layers - Multiple layer objects containing 1 tile map array each.
     */
    layers: [],
    /**
     * @property {array} tilesets - Image data for the tileset to be used. TODO: Figure out how to specify what layer a tileset belongs to.
     */
    tilesets: [],
    /**
     * @property {string} orientation - Describes the grid system used. "Flat" - orthogonal, isometric, hexagonal.
     */
    orientation: tiledMap.orientation,
    /**
     * @property {string} renderorder - Determines which tiles are rendered first. left to right, top to bottom. right to left, top to bottom etc.
     */
    renderorder: tiledMap.renderorder,
    /**
     * @property {object} properties - Stores custom properties set in Tiled Editor.
     */
    properties: {}
  };

  for (var i = 0; i < tiledMap.properties.length; i++)
  {
    var levelProperties = tiledMap.properties[i];
    map2d.properties[i] = levelProperties;
  }


  // Set tilesets
  for (var i = 0; i < tiledMap.tilesets.length; i++)
  {
    var tileset = tiledMap.tilesets[i];
    map2d.tilesets[i] = {
      /**
       * @property {string} name - Name given to tileset by Tiled Editor
       */
      name: tileset.name,
      /**
       * @property {string} image - Image file name. Set as image.src = environmentPath + image.
       */
      image: tileset.image,
      /**
       * @property {number} firstgid - Specifies the first gid of the first tile in a tileset. Needed for when multiple tilesets are used.
       */
      firstgid: tileset.firstgid,
      /**
       * @property {number} imagewidth - Width of tileset image in pixels.
       */
      imagewidth: tileset.imagewidth,
      /**
       * @property {number} imageheight - Height of tileset image in pixels.
       */
      imageheight: tileset.imageheight,
      /**
       * @property {number} margin - Padding amount for each tile in pixels.
       */
      margin: tileset.margin,
      /**
       * @property {number} spacing - Offset amount for each tile in pixels.
       */
      spacing: tileset.spacing,
      /**
       * @property {number} tilecount - Number of tiles in tileset.
       */
      tilecount: tileset.tilecount,
      /**
       * @property {number} tilewidth - Width of a single tile in pixels.
       */
      tilewidth: tileset.tilewidth,
      /**
       * @property {number} tileheight - Height of a single tile in pixels.
       */
      tileheight: tileset.tileheight,
      /**
       * @property {object} map - Map object for tileset. Allows for easier mapping of gid's and x, y coordinates to pass to drawImage calls.
       */
      map: {},
      /**
       * @property {object} properties - Custom tileset properties specified in Tiled Editor.
       */
      properties: {}
    };

    for (var j = 0; j < tileset.properties.length; j++)
    {
      var tilesetProperties = tileset.properties[j];
      map2d.tilesets[i].properties[j] = tilesetProperties;
    }
  }

  // Loop through tileMap.layers so we can write the 2d array to map2d.layer[ i ].data.
  for (var i = 0; i < tiledMap.layers.length; i++)
  {
    var tiledMapLayer = tiledMap.layers[i];

    var layer = {
      /**
       * @property {string} name - Name of layer. e.g. "Background".
       */
      name: tiledMapLayer.name,
      /**
       * @property {string} type - Type of layer. e.g. "tilelayer", "objectlayer" or "imagelayer".
       */
      type: tiledMapLayer.type,
      /**
       * @property {array} data - Map2d array. Converted two dimensional array is stored here.
       */
      data: tiledMapLayer.data,
      /**
       * @property {number} width - Width of layer in number of tiles.
       */
      width: tiledMapLayer.width,
      /**
       * @property {number} height - Height of layer in number of tiles.
       */
      height: tiledMapLayer.height,
      /**
       * @property {number} x - x offset of layer.
       */
      x: tiledMapLayer.x,
      /**
       * @property {number} y - y offset of layer.
       */
      y: tiledMapLayer.y,
      /**
       * @property {number} opacity - Alpha level of layer in the range 0.0 - 1.0. 0.0 - fully transparent, 1.0 - fully opaque.
       */
      opacity: tiledMapLayer.opacity,
      /**
       * @property {boolean} visible - Sets if layer is visible or not.
       */
      visible: tiledMapLayer.visible
    };

    map2d.layers[i] = layer;
    var map2dLayer = map2d.layers[i];
    map2dLayer.data = [];

    var cellCount = 0;

    // Create correct number of row arrays. "r" = row.
    for (var r = 0; r < map2dLayer.height; r++)
    {
      var row = [];
      map2dLayer.data.push(row);

      // Create correct number of items for each row. "c" = column.
      for (var c = 0; c < map2dLayer.width; c++)
      {
        var cell = {};
        /**
         * @property {number} data[i].gid - Grid id of tile Specifies what tile to draw from tileset.
         */
        cell.gid = tiledMapLayer.data[cellCount];
        /**
         * @property {number} data[i].x - x location of tile.
         */
        cell.x = ( ( c+1 )*map2d.tilewidth )-map2d.tilewidth;
        /**
         * @property {number} data[i].y - y location of tile.
         */
        cell.y = ( ( r+1 )*map2d.tileheight )-map2d.tileheight;
        /*console.log(cell.gid);
         console.log(cell.x);
         console.log(cell.y);*/
        map2dLayer.data[r].push(cell);

        cellCount++;
      }
    }
  }

  return map2d;
};


/*
 * Load image, create buffer canvas, draw image to buffer canvas, calls buildMap method inside image.onload event handler.
 * Calling buildMap from here is necessary as we must be sure the tileset image has loaded before it can be used.
 * Failure to do this can result in missing tiles or no tiles being drawn at all.
 * Layer references to appropriate buffer canvas are set in here.
 *
 * @method Tilemap.tilesetLoader
 * @param {object} stageContext - EaselJS Stage canvas context.
 * @param {string} path - Path to directory containing the tileset image.
 */
Tilemap.prototype.tilesetLoader = function (stage, stageContext, path)
{
  var self = this;

  var tilesetImg = new Image();
  tilesetImg.src = path+this.map2d.tilesets[0].image.replace(/^.*[\\\/]/, ''); // chop the auto "../" Tiled adds to src path.

  /* var buffer = document.createElement('canvas');
   buffer.context = buffer.getContext('2d');
   buffer.context.imageSmoothingEnabled = false;
   buffer.width = this.map2d.tilesets[0].imagewidth;
   buffer.height = this.map2d.tilesets[0].imagewidth;*/

  //this.map2d.tilesets[0].buffer = buffer;


  // Draw image to buffer canvas once loaded. Draw from buffer canvas context.
  tilesetImg.onload = function ()
  {
    self.map2d.tilesets[0].image = tilesetImg;
    //buffer.context.drawImage(tilesetImg, 0, 0, buffer.width, buffer.height);
    self.buildMap(stage, stageContext, self.map2d.width*self.map2d.tilewidth, self.map2d.height*self.map2d.tileheight, 0, 0);
  };

  // TODO(matt): Figure out how to best attach each tileset canvas to a buffer canvas. We will need 1 buffer per tileset.

  // Create tileset map2d and object
  for (var i = 0; i < this.map2d.tilesets.length; i++)
  {
    var tileset = this.map2d.tilesets[i];
    var rowCount = tileset.imageheight/tileset.tileheight;
    var colCount = tileset.imagewidth/tileset.tilewidth;
    var cellCount = 1;
    tileset.map = {
      0: "empty"
    };

    for (var r = 0; r < rowCount; r++)
    {
      var row = [];

      for (var c = 0; c < colCount; c++)
      {
        var cell = {};
        cell.x = ( ( c+1 )*tileset.tilewidth )-tileset.tilewidth;
        cell.y = ( ( r+1 )*tileset.tileheight )-tileset.tileheight;
        tileset.map[cellCount] = cell;
        cellCount++;
      }

    }
  }
};


/*
 * Build Tilemap from created 2D array. This is the final method that is called on Tilemap.
 *
 * @method Tilemap.buildMap
 * @param {object} stageContext - EaselJS Stage canvas context.
 * @param {object} tilesetBuffer - Buffer canvas object that stores the drawn tileset image.
 * @param {number} levelWidth - Width of level in pixels.
 * @param {number} levelHeight - Height of level in pixels.
 * @param {number} x - x offset for the map in pixels.
 * @param {number} y - y offset for the map in pixels.
 */
Tilemap.prototype.buildMap = function (stage, stageContext, levelWidth, levelHeight, x, y)
{
  var self = this;

  // Debug value. set to 1 for full map size.
  var mapScale = 1;
  // Update Level bounds to Tilemap bounds for use outside of Tilemap class.
  levelWidth = this.map2d.width*this.map2d.tilewidth;
  levelHeight = this.map2d.height*this.map2d.tileheight;

  // Set Tilemap global vars
  var mapWidth = this.map2d.width;
  var mapHeight = this.map2d.height;
  var layers = this.map2d.layers;
  var mapTileWidth = this.map2d.tilewidth;
  var mapTileHeight = this.map2d.tileheight;

  var tilemapContainer = new createjs.Container();
  tilemapContainer.x = 0;
  tilemapContainer.y = 0;

  tilemapContainer.tickEnabled = false;
  tilemapContainer.tickChildren = false;
  tilemapContainer.tickOnUpdate = false;
  tilemapContainer.mouseEnabled = false;
  tilemapContainer.snapToPixel = false;

  stage.addChild(tilemapContainer);

  for (var i = 0; i < layers.length; i++)
  {
    var layerContainer = new createjs.Container();
    layerContainer.x = 0;
    layerContainer.y = 0;

    layerContainer.tickEnabled = false;
    layerContainer.tickChildren = false;
    layerContainer.tickOnUpdate = false;
    layerContainer.mouseEnabled = false;
    layerContainer.snapToPixel = false;

    tilemapContainer.addChild(layerContainer);

    // Each layer
    // Set layer vars
    var layerName = layers[i].name;
    var layerType = layers[i].type;
    var map2dData = layers[i].data;
    var layerX = layers[i].x = x || 0;
    var layerY = layers[i].y = ( (y+this.worldHeight)-levelHeight ) || 0;
    var layerWidth = layers[i].width;
    var layerHeight = layers[i].height;
    var layerOpacity = layers[i].opacity;
    var layerVisibile = layers[i].visible;
    var tileset = this.map2d.tilesets[i];
    for (var r = 0; r < map2dData.length; r++)
    {
      var row = map2dData[r];

      for (var c = 0; c < row.length; c++)
      {
        var cell = row[c];

        function debugMode(mapScale)
        {
          stageContext.fillStyle = "white";

          if (cell.gid === 1)
          {
            stageContext.fillStyle = "red";
          }
          else if (cell.gid === 2)
          {
            stageContext.fillStyle = "green";
          }
          else if (cell.gid === 3)
          {
            stageContext.fillStyle = "pink";
          }
          else if (cell.gid === 4)
          {
            stageContext.fillStyle = "purple";
          }
          stageContext.fillRect(cell.x/mapScale, cell.y/mapScale, self.map2d.tilewidth/mapScale, self.map2d.tileheight/mapScale);
        }

        if (cell.gid !== 0)
        {
          var tileset = this.map2d.tilesets[0];
          var stage_destX = ((cell.x+layerX))*mapScale;
          var stage_destY = ((cell.y+layerY))*mapScale;
          var tile = new createjs.Bitmap(this.map2d.tilesets[0].image);
          tile.x = cell.x;
          tile.y = cell.y;
          tile.sourceRect = {x:tileset.map[cell.gid].x, y:tileset.map[cell.gid].y, width:tileset.tilewidth, height:tileset.tilewidth };

          tile.tickEnabled = false;
          tile.mouseEnabled = false;
          tile.snapToPixel = false;

          layerContainer.addChild(tile);

          /*stageContext.drawImage(tilesetBuffer,
           // Source
           tileset.map[cell.gid].x, tileset.map[cell.gid].y,
           tileset.tilewidth, tileset.tileheight,
           // Stage canvas draw destination.
           stage_destX, stage_destY,
           self.map2d.tilewidth*mapScale, self.map2d.tileheight*mapScale
           );*/
          //debugMode(mapScale);
        }
      }

    }

  }

};

Tilemap.prototype.update = function (camera, stageContext, x, y)
{
  // Called in our main render loop to update drawing to regions of the tilemap in view.
  // Updates all map related data.
  // TODO: Camera specifies the area to draw tiles within. Anything outside the camera view will no be drawn.
  //this.buildMap(stageContext, this.map2d.tilesets[0].buffer, this.map2d.width, this.map2d.height, x, y);
};