define(function() {

  var Platform = function(rect) {
    this.rect = rect;
    this.rect.right = rect.x + rect.width;
    this.type = rect.type;

    

    this.el = $('<div class="platform">');
    this.el.css({
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,

    });
  };

  Platform.prototype.onFrame = function(delta) {

      
  };

  // Collision?

  return Platform;
});