let AI = (function () {
  'use strict';

  const e = 0.001;

  class Actor {
    constructor(pos, dir, state) {
      this.pos = pos || M.point2d(0, 0);
      this.dir = dir || M.point2d(-1, 0);
      this.state = state || new Standing(this);
    }

    update(delta) {
      this.state.update(delta);
    }
  }

  class State {
    constructor(owner) {
      this.owner = owner;
    }

    update(delta) {}

    moveState(nextState) {
      this.onExit();
      nextState.onEnter();
    }

    onEnter() {}
    onExit() {}
  }

  class Standing extends State {
    constructor(owner) {
      super(owner);
    }
  }

  class Thinking extends State {
    constructor(owner, duration) {
      super(owner);
      this.duration = duration;
    }

    update(delta) {
      this.duration -= delta;
      if (this.duration <= 0) {
        console.log('done thinking')
      }
    }
  }

  class Wandering extends State {

    constructor(owner, map) {
      super(owner);
      this.map = map;
    }

    update(delta) {
      if (this.owner.pos.copy().minus(this.to).sqLength() > e) {
        let deltaMoveSpeed = playerMoveSpeed * delta;
        let dir = this.to.copy().minus(this.owner.pos).unit();
        let speed = dir.copy().scale(deltaMoveSpeed);
      } else {
        console.log('done wandering');
      }
    }

    onEnter() {
      // pick point
      let pos = owner.copy().floor();
      let arr = [];
      for (let x = pos.x - 1; x < pos.x + 2; x++) {
        for (let y = pos.y - 1; y < pos.y + 2; x++) {
          if (!this.map.isSolid(x, y)) {
            arr.push([x, y]);
          }
        }
      }
      let idx = Math.floor(Math.random() * arr.length)
      this.to = M.point(arr[idx][0] + 0.5, arr[idx][1] + 0.5); // Add random amount
    }
  }

  return {
    criter: function () {
      return {};
    },
    placeholder: function (pos) {
      return new Actor(pos);
    }
  }
}());
