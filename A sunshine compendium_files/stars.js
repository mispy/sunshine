// Generated by CoffeeScript 1.3.3
// (...mostly. this is incredibly hacky, please don't read.)
(function() {
  var STAR_COLOR, TOTAL_STARS, ready,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();

  TOTAL_STARS = 5000;

  STAR_COLOR = [255, 255, 255];

  window.StellarClass = (function() {

    function StellarClass() {}

    StellarClass.frequency = {
      O: 0.0000003,
      B: 0.0013,
      A: 0.006,
      F: 0.03,
      G: 0.076,
      K: 0.121,
      M: 0.7645
    };

    StellarClass.luminosity = {
      O: 30000,
      B: 27500,
      A: 15,
      F: 3.25,
      G: 1.05,
      K: 0.34,
      M: 0.08
    };

    StellarClass.random = function() {
      var last, rand, sclass, val, _ref;
      rand = Math.random();
      last = null;
      _ref = StellarClass.frequency;
      for (sclass in _ref) {
        val = _ref[sclass];
        if (rand < val) {
          return sclass;
        }
        last = sclass;
      }
      return last;
    };

    return StellarClass;

  }).call(this);

  window.Star = (function() {

    Star.tinted_images = {};

    function Star(props) {
      var key, val;
      for (key in props) {
        val = props[key];
        this[key] = val;
      }
      this.luminosity = StellarClass.luminosity[this.sclass];
      this.luminosity += Math.random() * (StellarClass.luminosity[this.sclass] / 2);
      this.luminosity -= Math.random() * (StellarClass.luminosity[this.sclass] / 2);
      this.img = document.getElementById("star" + this.sclass);
    }

    return Star;

  })();

  window.Map = (function() {

    function Map() {
      this.setup = __bind(this.setup, this);

      this.begin = __bind(this.begin, this);

      this.resize = __bind(this.resize, this);

      this.render = __bind(this.render, this);

      this.loop = __bind(this.loop, this);

    }

    Map.prototype.stars = [];

    Map.prototype.started = false;

    Map.prototype.mouseX = 0;

    Map.prototype.mouseY = 0;

    Map.prototype.twinkle = 1;

    Map.prototype.last_time = 0;

    Map.prototype.loop = function(timestamp) {
      var dt, shift, star, _i, _len, _ref;
      dt = (timestamp - this.last_time) || 16;
      _ref = this.stars;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        star = _ref[_i];
        shift = 0;
        while (star.x + shift > this.ww) {
          shift -= this.ww;
          star.y = Math.random() * this.wh;
        }
        while (star.x + shift < 0) {
          shift += this.ww;
          star.y = Math.random() * this.wh;
        }
        star.x += shift;
      }
      this.twinkle += dt / 650;
      this.render();
      this.last_time = timestamp;

      if (!this.paused) {
        return requestAnimationFrame(this.loop);
      }
    };

    Map.prototype.render = function() {
      var lumen, star, _i, _len, _ref, _results;
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = "rgb(0,0,0)";
      this.ctx.fillRect(0, 0, this.ww, this.wh);
      _ref = this.stars;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        star = _ref[_i];
        if (star.luminosity > 1) {
          lumen = 2 * Math.log(10 * star.luminosity);
        } else {
          lumen = 10 * star.luminosity;
        }
        lumen += star.speed / 2;
        lumen = Math.round(lumen);
        if (lumen > 6) {
          this.ctx.globalAlpha = 1;
        } else {
          this.ctx.globalAlpha = Math.abs(Math.sin(this.twinkle + star.speed));
        }
        _results.push(this.ctx.drawImage(star.img, Math.floor(star.x - lumen / 2), Math.floor(star.y - lumen / 2), lumen, lumen));
      }
      return _results;
    };

    Map.prototype.resize = function() {
      var obj, old_wh, old_ww, _i, _len, _ref;
      old_ww = this.ww;
      old_wh = this.wh;
      this.ww = $('canvas').width();
      this.wh = $('canvas').height();
      _ref = this.stars;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        obj.x = obj.x * (this.ww / old_ww);
        obj.y = obj.y * (this.wh / old_wh);
      }
      this.canvas.setAttribute('width', this.ww);
      this.canvas.setAttribute('height', this.wh);
      return this.render();
    };

    Map.prototype.begin = function() {
      var i, speed, star, _i,
        _this = this;
      if (this.started) {
        return;
      }
      this.loadedImages = 0;
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext("2d");
      this.resize();

      for (i = _i = 0; 0 <= TOTAL_STARS ? _i <= TOTAL_STARS : _i >= TOTAL_STARS; i = 0 <= TOTAL_STARS ? ++_i : --_i) {
        if (Math.random() < 0.9) {
          speed = 1 + Math.random() * 6;
        } else {
          speed = Math.random() * 10;
        }
        star = new Star({
          x: Math.random() * this.ww,
          y: Math.random() * this.wh,
          sclass: StellarClass.random(),
          speed: speed
        });
        this.stars.push(star);
      }

      _this = this;
      $('.star').each(function() {
        onload = function() {
          _this.loadedImages += 1;
          if (_this.loadedImages == 7) {
            _this.loop();
          }
        }

        if (this.complete) {
          onload();
        } else {
          this.onload = onload;
        }
      });

      var _this = this;
      $(this.canvas).on('mousedown', function() {
        _this.paused = false;
        _this.loop();
      });
      $(window).on('mouseup', function() {
        _this.paused = true;
      });

      _this.paused = true;
      window.onresize = this.resize;
      this.started = true;
    };

    Map.prototype.setup = function() {
      return this.begin();
    };

    return Map;

  })();

  $(document).ready(function() {
    if ($("header.site-head").length) {
      window.map = new Map;
      return map.setup();
    }
  });

}).call(this);
