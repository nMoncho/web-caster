let Input = (function () {
  'use strict';

  const playerFor = 'PLAYER_FORWARD';
  const playerBac = 'PLAYER_BACKWARD';
  const playerTl = 'PLAYER_TURN_LEFT';
  const playerTr = 'PLAYER_TURN_RIGHT';
  const playerSl = 'PLAYER_STRAFE_LEFT';
  const playerSr = 'PLAYER_STRAFE_RIGHT';
  const playerUse = 'PLAYER_USE';
  const playerFir = 'PLAYER_FIRE';
  const canvas = document.querySelector('#caster');
  let movementX = 0;

  // pointer lock object forking for cross browser

  canvas.requestPointerLock = canvas.requestPointerLock ||
                              canvas.mozRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
                             document.mozExitPointerLock;

  canvas.onclick = function() {
    canvas.requestPointerLock();
  };

  let keys = {},
      keyNames = [playerFor, playerBac, playerTl, playerTr, playerSl, playerSr, playerUse, playerFir],
      mapping = [
        [playerFor, 87],
        [playerBac, 83],
        [playerTl, 90],
        [playerTr, 67],
        [playerSl, 65],
        [playerSr, 68],
        [playerUse, 69],
        [playerFir, 17],
      ].reduce(function (acc, [key, value]) {
        acc[key] = value;
        return acc;
      }, {});

  function onPress (e) {
    keys[e.keyCode] = true;

  }

  function onRelease (e) {
    keys[e.keyCode] = false;
  }

  function mouseMoveHandler (e) {
    movementX = e.movementX;
  }

  // pointer lock event listeners

  // Hook pointer lock state change events for different browsers
  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

  function lockChangeAlert() {
    if (document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas) {
      console.log('The pointer lock status is now locked');
      document.addEventListener("mousemove", mouseMoveHandler, false);
    } else {
      console.log('The pointer lock status is now unlocked');
      document.removeEventListener("mousemove", mouseMoveHandler, false);
    }
  }

  document.querySelector('body').addEventListener('keydown', onPress);
  document.querySelector('body').addEventListener('keyup', onRelease);

  return {
    getMovementX: function () {
      let tmpX = movementX;
      movementX = 0;
      return tmpX;
    },
    isPressed: function (keyCode) {
      return keys[e.keyCode];
    },
    isMapPressed: function (keyMap) {
      return keys[mapping[keyMap]];
    },
    setMapping: function (newMap) {
      map = newMap;
    },
    KEYS: keyNames.reduce(function (acc, key) {
      acc[key] = key;
      return acc;
    }, {})
  };

}());
