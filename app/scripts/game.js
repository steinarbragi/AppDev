/*global define, alert, Howl */

define(['controls', 'player', 'platform', 'coin'], function(controls, Player, Platform, Coin) {

  var transform = $.fx.cssPrefix + 'transform';


  //to get a random integer in a range from min to max (for platform postioning)
  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // How far from each edge should the player be.
  var VIEWPORT_PADDING = 100;

  /**
   * Main game class.
   * @param {Element} el DOM element containig the game.
   * @constructor
   */
  var Game = function(el) {
    this.el = el;
    this.worldEl = el.find('.world');
    this.platformsEl = el.find('.platforms');
    this.coinsEl = el.find('.coins');
    this.scoreEl = el.find('.score .value');
    this.scoreTotal = 0;
    this.heightReached = 0;

    this.entities = [];
    this.player = new Player(this.el.find('.player'), this);

    /*this.sound = new Howl({
      urls: ['sounds/main.mp3', 'sounds/main.ogg'],
      sprite: {
        blast: [0, 2000],
        laser: [3000, 700],
        winner: [5000, 9000]
      }
    });*/
    
    // Cache a bound onFrame since we need it each frame.
    this.onFrame = this.onFrame.bind(this);
  };

  /**
   * Reset all game state for a new game.
   */
  Game.prototype.reset = function() {
    // Reset world.
    this.entities.forEach(function(e) { e.el.remove(); });
    this.entities = [];
    this.createWorld();
    this.player.pos = {x: 700, y: 418};

    // Reset viewport.
    this.viewport = {x: 0, y: 0, width: 910, height:479};

    // Coins
    this.collectedCoins = 0;
    this.scoreEl.text(0);

    // Start game
    this.unfreezeGame();
  };


  Game.prototype.createWorld = function() {
    // Ground.

    for(var i = 0; i<300; i++)
    {

      var thetype = "normal";
      if (getRandomInt(60, 400) == 1)
        thetype='move';
      


      this.addPlatform(new Platform({
      x: getRandomInt(100, 600),
      y: 300 - (i*100),
      width: getRandomInt(60, 400),
      height: 10,
      type: thetype
    }));
    }


    for(var j = 0; j<30; j++)
    {

      this.addCoin(new Coin({
      x: getRandomInt(100, 600),
      y: 250 - (j*100*getRandomInt(1,10))
      }));
 

    }

    //ground
    this.addPlatform(new Platform({
      x: 100,
      y: 418,
      width: 800,
      height: 10
    }));

  
  };

  Game.prototype.addPlatform = function(platform) {
    this.entities.push(platform);
    this.platformsEl.append(platform.el);
  };

  Game.prototype.addCoin = function(coin) {
    this.entities.push(coin);
    this.coinsEl.append(coin.el);
  };

  Game.prototype.hitCoin = function(coin) {
    this.collectedCoins++;
    this.scoreTotal += 100;
    this.scoreEl.text(Math.round(this.scoreTotal+this.heightReached/10));
    coin.hit();
  };


  Game.prototype.forEachPlatform = function(fun) {
    for (var i = 0, e; e = this.entities[i]; i++) {
      if (e instanceof Platform) {
        fun(e);
      }
    }
  };

  Game.prototype.forEachCoin = function(fun) {
    for (var i = 0, e; e = this.entities[i]; i++) {
      if (e instanceof Coin) {
        fun(e);
      }
    }
  };

  /**
   * Runs every frame. Calculates a delta and allows each game entity to update itself.
   */
  Game.prototype.onFrame = function() {
    if (!this.isPlaying) {
      return;
    }

    var now = +new Date() / 1000,
        delta = now - this.lastFrame;
    this.lastFrame = now;

    controls.onFrame(delta);
    this.player.onFrame(delta);

    for (var i = 0, e; e = this.entities[i]; i++) {
      e.onFrame(delta);

      if (e.dead) {
        this.entities.splice(i--, 1);
      }
    }


    //update the score by max height reached
    if((1-this.player.pos.y + 417)>this.heightReached)
    {
      this.heightReached = (1-this.player.pos.y + 417)
      this.scoreEl.text(Math.round(this.scoreTotal+this.heightReached/10));
    }
    this.updateViewport();

    // Request next frame.
    requestAnimFrame(this.onFrame);
  };

  Game.prototype.updateViewport = function() {
    // Find min and max Y for player in world coordinates.
    var minY = this.viewport.y + VIEWPORT_PADDING;
    var maxY = this.viewport.y + this.viewport.height - VIEWPORT_PADDING;
    // Player position
    var playerY = this.player.pos.y;
    //Update the viewport if needed.
    if (playerY < minY) {
      this.viewport.y = playerY - VIEWPORT_PADDING;
    } else if (playerY > maxY) {
      this.viewport.y = playerY + VIEWPORT_PADDING - this.viewport.height;
    }


    // Let's not go outside the level.
    // TODO: Level end?
    // this.viewport.y = Math.max(0, this.viewport.y);
    
    this.worldEl.css(transform, 'translate(0,' + (-this.viewport.y) + 'px)');


  };

  /**
   * Starts the game.
   */
  Game.prototype.start = function() {
    this.reset();
  };

  /**
   * Stop the game and notify user that he has lost.
   */
  Game.prototype.gameover = function() {
    alert('You are game over!');
    this.freezeGame();

    var game = this;
    setTimeout(function() {
      game.reset();
    }, 0);
  };

  /**
   * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
   * Can be used both for game over and pause.
   */
  Game.prototype.freezeGame = function() {
    this.isPlaying = false;
    this.el.addClass('frozen');
  };

  /**
   * Unfreezes the game. Starts the game loop again.
   */
  Game.prototype.unfreezeGame = function() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.el.removeClass('frozen');

      // Restart the onFrame loop
      this.lastFrame = +new Date() / 1000;
      requestAnimFrame(this.onFrame);
    }
  };

  /**
   * Cross browser RequestAnimationFrame
   */
  var requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function */ callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();

  return Game;
});