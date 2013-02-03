(function() {

  define(['controls'], function(controls) {
    var Player;
    Player = (function() {

      Player.prototype.speed = 200;

      function Player(el) {
        this.el = el;
        this.pos = {
          x: 0,
          y: 0
        };
      }

      Player.prototype.onFrame = function(delta) {
        if (controls.spacePressed) {
          this.pos.x += delta * this.speed;
        }
        if (this.pos.x > 200 || this.pos.x < 0) {
          this.speed *= -1;
        }
        return this.el.css('-webkit-transform', "translate(" + this.pos.x + "px," + this.pos.y + "px)");
      };

      return Player;

    })();
    return Player;
  });

}).call(this);
