let M = (function () {
  'use strict';

  class Point2d {
    constructor(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }

    set(x, y) {
      if (x instanceof Point2d) {
        this.x = x.x;
        this.y = x.y;
      } else {
        this.x = x || 0;
        this.y = y || 0;
      }
      return this;
    }

    copy(x, y) {
      return new Point2d(x || this.x, y || this.y);
    }

    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    }

    plus(other) {
      this.x = this.x + other.x;
      this.y = this.y + other.y;
      return this;
    }

    minus(other) {
      this.x = this.x - other.x;
      this.y = this.y - other.y;
      return this;
    }

    scale(scalar) {
      this.x = this.x * scalar;
      this.y = this.y * scalar;
      return this;
    }

    rotate(rot) {
      let cs = Math.cos(rot),
          sn = Math.sin(rot);

      let tmpX = this.x * cs - this.y * sn;
      this.y = this.x * sn + this.y * cs;
      this.x = tmpX;
      return this;
    }

    sqLength() {
      return this.x * this.x + this.y * this.y;
    }

    length() {
      return Math.sqrt(this.sqLength());
    }

    normal() {
      return new Point2d(-this.y, this.x);
    }

    unit() {
      let length = this.length();
      this.x = this.x / length;
      this.y = this.y / length;
      return this;
    }
  }

  class Circle {
    constructor(center, radius, radiusOpt) {
      if (center instanceof Point2d) {
        this.center = center;
        this.radius = radius || 1;
      } else {
        this.center = new Point2d(center, radius);
        this.radius = radiusOpt || 1;
      }
    }

    collides(other) {
      if (other instanceof Circle) {
        return this.center.copy()
          .minus(other.center)
          .sqLength() < (this.radius + other.radius) * (this.radius + other.radius);
      } else if (other instanceof Point2d) {
        return this.center.copy()
          .minus(other)
          .sqLength() < this.radius * this.radius;
      }
    }
  }

  return {
    point2d: function (x, y) {
      return new Point2d(x, y);
    },
    circle: function (center, radius) {
      return new Circle(center, radius);
    },
    degToRad: function (deg) {
      return deg * (Math.PI / 180);
    },
    radToDeg: function (rad) {
      return rad * (180 / Math.PI);
    }
  }
}());
