const P = (function () {
  'use strict';

  const MOVE_SPEED = 2;
  const ROTATION_SPEED = 3;

  class Player {
    constructor (pos, dir, pla, map) {
      this.pos = pos || M.point2d(0, 0);
      this.dir = dir || M.point2d(0, -1);
      this.pla = pla || M.point2d(1, 0);
      this.map = map;
    }

    processInput (delta) {
      let pos = this.pos;
      let dir = this.dir;
      let pla = this.pla;
      let deltaMoveSpeed = MOVE_SPEED * delta;

      let speed = dir.copy().scale(deltaMoveSpeed);
      let dirNormal = dir.normal();
      let speedNormal = dirNormal.scale(deltaMoveSpeed);

      function rotatePlayer () {
        let deltaRotSpeed = ROTATION_SPEED * delta;
        let movementX = Input.getMovementX();
        // let rotationFactor = Math.max(Math.min(movementX, 3), -3) || 1;
        let rotationFactor = 1; // TODO for now

        if (Input.isMapPressed(Input.KEYS.PLAYER_TURN_LEFT) || movementX < 0) {
          dir.rotate(-deltaRotSpeed * Math.abs(rotationFactor));
          pla.rotate(-deltaRotSpeed * Math.abs(rotationFactor));
        }
        if (Input.isMapPressed(Input.KEYS.PLAYER_TURN_RIGHT) || movementX > 0) {
          dir.rotate(deltaRotSpeed * Math.abs(rotationFactor));
          pla.rotate(deltaRotSpeed * Math.abs(rotationFactor));
        }
      }

      let posOff = M.point2d(0, 0);
      if (Input.isMapPressed(Input.KEYS.PLAYER_FORWARD)) {
        posOff.plus(speed);
      }
      if (Input.isMapPressed(Input.KEYS.PLAYER_BACKWARD)) {
        posOff.minus(speed);
      }
      if (Input.isMapPressed(Input.KEYS.PLAYER_STRAFE_LEFT)) {
        posOff.minus(speedNormal);
      }
      if (Input.isMapPressed(Input.KEYS.PLAYER_STRAFE_RIGHT)) {
        posOff.plus(speedNormal);
      }

      // TODO improve collision detection against corners
      // TODO improve collision detection by nulling only colliding slide
      // let checkPos = pos.copy().plus(posOff.copy().scale(1.2));
      // if (map.data[Math.floor(checkPos.x)][Math.floor(checkPos.y)] === 0) {
      //   pos.plus(posOff);
      // }
      const scaleFactor = 3;
      let checkPos1 = pos.copy().plus(posOff.copy().scale(scaleFactor));
      let checkPos2 = checkPos1.copy().minus(pla.copy().scale(0.01));
      let checkPos3 = checkPos1.copy().plus(pla.copy().scale(0.01));
      if (this.map.data[Math.floor(checkPos1.x)][Math.floor(checkPos1.y)] === 0 /*&&
          map.data[Math.floor(checkPos2.x)][Math.floor(checkPos2.y)] === 0 &&
          map.data[Math.floor(checkPos3.x)][Math.floor(checkPos3.y)] === 0*/) {
          pos.plus(posOff);
          //console.log(pos);
      } else {
        // check x movement
        let posTmp = posOff.copy();
        checkPos1 = checkPos1.set(pos).plus(posTmp.set(posOff.x, 0).scale(scaleFactor));
        if (this.map.data[Math.floor(checkPos1.x)][Math.floor(checkPos1.y)] === 0) {
          pos.plus(posTmp);
          //console.log(pos);
        } else {
          posTmp = posTmp.set(0, posOff.y).scale(scaleFactor);
          checkPos1 = checkPos1.set(pos).plus(posTmp);
          if (this.map.data[Math.floor(checkPos1.x)][Math.floor(checkPos1.y)] === 0) {
            pos.plus(posTmp);
            //console.log(pos);
          }
        }
      }

      rotatePlayer();
    }
  }

  return {
    create: function (pos, dir, pla, map) {
      return new Player(pos, dir, pla, map);
    }
  }

}());
