let Maps = (function () {
  'use strict';

  const cellSize = 1
  const cellHalfSize = cellSize / 2;
  const EMPTY_CELL = 0x000000ff;

  let worldMap = [
    [1,1,2,3,2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ].transpose();

  function loadMap (tagId) {
    const tag = document.getElementById(tagId);
    const img = U.loadImage(tagId, true);
    const data = img.imageData.reduce(function (acc, block, idx) {
      const row = Math.floor(idx / img.width);
      let arr = acc[row];
      if (!arr) {
        arr = [];
        acc.push(arr);
      }
      if (block === EMPTY_CELL) {
        arr.push(0);
      } else {
        arr.push(block);
      }

      return acc;
    }, []).transpose(); // Rotate (or transpose) the image so 'world' looks like image.

    const map = {
      id: tagId,
      name: tag.getAttribute('name') || 'no-name',
      data: data,
      width: img.width,
      height: img.height,
      actors: [
        AI.placeholder(M.point2d(3.5, 10))
      ],
      isSolid: function(x, y) {
        return this.data[x][y];
      },
      isInside: function (pos, buff) {
        let x = Math.floor(pos.x + ((buff && buff.x) || 0))
        let y = Math.floor(pos.y + ((buff && buff.y) || 0))
        return this.data[x][y];
      }
    };
    map.player = P.create(M.point2d(5.5, 5.5), M.point2d(0, -1), M.point2d(1, 0), map);

    return map;
  }

  return {
    getMap: function (name) {
      return loadMap(name);
    }
  };

}());
