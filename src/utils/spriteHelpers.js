// EaselJS Sprite Helpers.
// Depth sort helper. Sprites with higher y values render over others.
var sortFunction = function(obj1, obj2, options) {
  if (obj1.y > obj2.y) { return 1; }
  if (obj1.y < obj2.y) { return -1; }
  return 0;
};