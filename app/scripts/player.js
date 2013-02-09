/*global $ define */

define(['controls'], function(controls) {

  var PLAYER_SPEED = 300;
  var JUMP_VELOCITY = 1000;
  var GRAVITY = 2500;
  var EDGE_OF_LIFE = 650; // DUM DUM DUM!
  var COIN_HIT_Y = -50;
  var COIN_HIT_DIST = 60;

  var transform = $.fx.cssPrefix + 'transform';

  var Player = function(el, game) {
    this.el = el;
    this.game = game;
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };

    controls.on('jump', this.onJump.bind(this));
  };

  Player.prototype.onJump = function() {
    // Jump
    if (this.vel.y === 0) {
      this.vel.y = -JUMP_VELOCITY;
      this.game.sound.play('blast');
    }
  };

  Player.prototype.onFrame = function(delta) {

    // Player input
    this.vel.x = controls.inputVec.x * PLAYER_SPEED;

    // Gravity
    this.vel.y += GRAVITY * delta;

    // Update state
    var oldY = this.pos.y;
    this.pos.x += this.vel.x * delta;
    this.pos.y += this.vel.y * delta;

    // Check collisions
    this.checkPlatforms(oldY);
    this.checkCoins();
    this.checkGameover();

    // Update UI.
    this.el.css(transform, 'translate(' + this.pos.x + 'px,' + this.pos.y + 'px)');

    this.el.toggleClass('walking', this.vel.x !== 0);
    this.el.toggleClass('jumping', this.vel.y < 0);
  };

  Player.prototype.checkPlatforms = function(oldY) {
    var pos = this.pos;
    var vel = this.vel;

    this.game.forEachPlatform(function(p) {
      // Are we crossing Y.
      if (p.rect.y >= oldY && p.rect.y < pos.y) {

        // Is our X within platform width
        if (pos.x > p.rect.x && pos.x < p.rect.right) {

          // Collision. Let's stop gravity.
          pos.y = p.rect.y;
          vel.y = 0;
        }
      }
    });
  };

  Player.prototype.checkCoins = function() {
    var centerX = this.pos.x;
    var centerY = this.pos.y + COIN_HIT_Y;
    var game = this.game;

    this.game.forEachCoin(function(c) {
      // dist = sqrt(xd * xd + yd * yd)
      var dist = Math.sqrt(Math.pow(c.pos.x - centerX, 2) + Math.pow(c.pos.y - centerY, 2));
      if (dist < COIN_HIT_DIST) {
        game.hitCoin(c);
      }
    });
  };

  Player.prototype.checkGameover = function() {
    if (this.pos.y > EDGE_OF_LIFE) {
      this.game.gameover();
    }
  };

  return Player;
});