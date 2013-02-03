(function() {

  define([], function() {
    var Controls;
    Controls = (function() {

      Controls.prototype.spacePressed = false;

      function Controls() {
        $(window).on('keydown', this.onKeyDown.bind(this)).on('keyup', this.onKeyUp.bind(this));
      }

      Controls.prototype.onKeyDown = function(e) {
        if (e.keyCode === 32) {
          return this.spacePressed = true;
        }
      };

      Controls.prototype.onKeyUp = function(e) {
        if (e.keyCode === 32) {
          return this.spacePressed = false;
        }
      };

      return Controls;

    })();
    return new Controls;
  });

}).call(this);
