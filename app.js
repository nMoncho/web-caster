(function() {
  'use strict';

  let canvas = document.getElementById('caster');

  const width = parseInt(canvas.getAttribute('width'), 10);
  const height = parseInt(canvas.getAttribute('height'), 10);
  const halfHeight = height / 2;

  let start = null;
  let ctx = canvas.getContext('2d');
  let map = Maps.getMap('test');
  let buffer = createBuffer(ctx);
  let zBuffer = [];
  let println = console.log

  function createBuffer(ctx) {
    let id = ctx.createImageData(width, height);
    return {
      id: id,
      data: id.data
    };
  }

  function renderFrame (ts) {
    let delta = (ts - start) / 1000;
    start = ts;
    let player = map.player;
    let d = buffer.data;

    player.processInput(delta);
    let posX = player.pos.x;
    let posY = player.pos.y;
    let dirX = player.dir.x;
    let dirY = player.dir.y;
    let planeX = player.pla.x;
    let planeY = player.pla.y;

    cleanBuffer();

    let actors = map.actors;
    let vis = [];
    for (let x = 0; x < width; x++) {
      // calculate ray position and direction
      let cameraX = (2 * x / width) - 1; // x-coordinate in camera space [-1, +1]
      let rayDirX = dirX + planeX * cameraX * 0.5; // rayDir = dir + scale(plane, cameraX)
      let rayDirY = dirY + planeY * cameraX * 0.5;
      let mapX = Math.floor(posX); // map = floor(pos) => 3.123 = 3 (think center of the cell)
      let mapY = Math.floor(posY);
      let deltaDistX = Math.sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX)); // = tan(alpha)
      let deltaDistY = Math.sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY)); // = tan(90 - alpha)
      //deltaDistX = Math.abs(1 / rayDirX);
      //deltaDistY = Math.abs(1 / rayDirY);
      let stepX = null, stepY = null;
      let sideDistX = null, sideDistY = null;

      // calculate step and initial sideDist
      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (posX - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1 - posX) * deltaDistX;
      }

      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (posY - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1 - posY) * deltaDistY;
      }

      let hit = 0;
      let side = 0;
      // perform DDA
      while (!hit) {
        // jump to next map square, OR in x-direction, OR in y-direction
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        // Check if ray has hit a wall
        vis.push([mapX, mapY]); // FIXME extremely inefficient.
        hit = map.data[mapX][mapY];
      }
      // Calculate distance of perpendicular ray (Euclidean distance will give fisheye effect!)
      let perpWallDist = 0;
      if (side === 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
      else            perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

      zBuffer[x] = perpWallDist;
      // Calculate height of line to draw on screen
      let lineHeight = Math.floor(height / perpWallDist);

      // Calculate lowest and highest pixel to fill in current stripe
      let drawStart = Math.max(Math.floor(-lineHeight / 2 + halfHeight), 0);
      let drawEnd = Math.min(Math.floor(lineHeight / 2 + halfHeight), height - 1);

      let color = hit
      if (side && hit) {
        color = color & 0x88888888;
      }
      drawColumn(d, x, drawStart, drawEnd, color);
    }
    renderText(d, 'This is some other text', 20, 30, 0);

    ctx.putImageData(buffer.id, 0, 0);
    window.requestAnimationFrame(renderFrame);
  }

  function renderPlaceholder (thing) {
    let d = buffer.data;
    const dim = 20 + thing.pos.x; // must move to camera space.
    let player = map.player;
    // use Euclidean distance for now, even if it produces fish eye
    let distance = thing.pos.copy().minus(player.pos).length();
    let lineHeight = Math.floor(height / distance);
    let drawStart = Math.max(Math.floor(-lineHeight / 2 + halfHeight), 0);
    let drawEnd = Math.min(Math.floor(lineHeight / 2 + halfHeight), height - 1);

    for (let x = thing.pos.x; x < dim; x++) {
      drawColumn(d, x, drawStart, drawEnd, [127, 0, 127, 255]);
    }
  }

  function renderThings (things) {
    // things should have been filtered already by checking the cell during ray casting.
    things.sort(function (one, another) {
      return one.pos.copy().minus(player.pos).sqLength() -
        another.pos.copy().minus(player.pos).sqLength();
    }).forEach(x => renderThing(x));


  }

  function renderThing (thing) {
    let distance = Math.abs(thing.pos.copy().minus(player.pos)).length();
    // Calculate height of line to draw on screen
    let lineHeight = Math.floor(height / distance);
    // Calculate lowest and highest pixel to fill in current stripe
    let drawStart = Math.max(Math.floor(-lineHeight / 2 + halfHeight), 0);
    let drawEnd = Math.min(Math.floor(lineHeight / 2 + halfHeight), height - 1);
    //
    let xStart = 0
    let xEnd = 0

    let color = [255, 0, 255, 255];
    for (let x = xStart; x < xEnd; x++) {
        if (zBuffer[x] < distance) continue;

        drawColumn(d, x, drawStart, drawEnd, color);
    }
  }

  function loadTexture (id) {
    const img = document.getElementById(id);
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    let ctxt = c.getContext('2d')
    ctxt.drawImage(img, 0, 0);
    let idd = ctxt.getImageData(0, 0, img.width, img.height);

    return {
      id: idd,
      data: idd.data,
      width: img.width,
      height: img.height
    };
  }

  const charWidth = 6;
  const charHeight = 8;
  const charDim = charWidth * charHeight;
  const font = loadTexture('font');
  const chars = '' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?"\'/\\<>()[]{}' +
    'abcdefghijklmnopqrstuvwxyz_               ' +
    '0123456789+-=*:;ÖÅÄå                      ';

  function renderText (d, text, x, y, color) {
    for (let c = 0; c < text.length; c++) {
      let idx = chars.indexOf(text[c]);

      let xx = idx % 42; // 42 is the amount of chars in a line
      let yy = Math.floor(idx / 42);
      let fIdx = xx * charWidth + yy * font.width * charHeight;
      renderSprite(d, font, x + c * charWidth, y, fIdx, charWidth, charHeight);
    }
  }

  function renderSprite(d, sprite, x, y, sIdx, sWidth, sHeight) {
    for (let i = 0; i < sWidth * sHeight; i++) {
      let spriteIdx = (Math.floor(i / sWidth) * sprite.width + (i % sWidth) + sIdx) * 4;
      let screenIdx = (((i % sWidth) + x) + (Math.floor(i / sWidth) + y) * width) * 4;

      if (sprite.data[spriteIdx] === 255 && sprite.data[spriteIdx + 1] === 0 && sprite.data[spriteIdx + 2] === 255) {
        continue;
      }
      d[screenIdx] = sprite.data[spriteIdx];
      d[screenIdx + 1] = sprite.data[spriteIdx + 1];
      d[screenIdx + 2] = sprite.data[spriteIdx + 2];
      d[screenIdx + 3] = sprite.data[spriteIdx + 3];
    }
  }

  function renderScaledSprite(d, sprite, x, y, sIdx, scale, sWidth, sHeight) {
    for (let i = 0; i < sWidth * sHeight * scale; i++) {
      let spriteX = (Math.floor(i / scale) % sWidth) - (sWidth * Math.floor(i / (sWidth * scale)));
      let spriteY = Math.floor((i / scale) / (scale * sWidth)) * sprite.width;
      let spriteIdx = (spriteY + spriteX + sIdx) * 4;
      let screenIdx = (((Math.floor(i / scale) % sWidth) + x) + (Math.floor((i / scale) / sWidth) + y) * width) * 4;

      if (font.data[spriteIdx] === 255 && font.data[spriteIdx + 1] === 0 && font.data[spriteIdx + 2] === 255) {
        continue;
      }
      d[screenIdx] = font.data[spriteIdx];
      d[screenIdx + 1] = font.data[spriteIdx + 1];
      d[screenIdx + 2] = font.data[spriteIdx + 2];
      d[screenIdx + 3] = font.data[spriteIdx + 3];
    }
  }

  function cleanBuffer () {
    let d = buffer.data;
    let dLength = d.length;
    // Clean Black
    // for (let i = 0; i < dLength; i += 4) {
    //   d[i] = 0;
    //   d[i + 1] = 0;
    //   d[i + 2] = 0;
    //   d[i + 3] = 255;
    // }

    // Clean floor and ceil
    // floor #707070 (0x19)
    // ceil 1 #383838 (0x1d)
    // ceil 2 #410041 (0xbf)
    // ceil 3 #007475 ???
    // ceil 4 #754c24 ???
    let dLength2 = d.length / 2;
    for (let i = 0; i < dLength2; i += 4) {
      d[i] = 0x38;
      d[i + 1] = 0x38;
      d[i + 2] = 0x38;
      d[i + 3] = 255;
    }
    for (let i = dLength2; i < dLength; i += 4) {
      d[i] = 0x70;
      d[i + 1] = 0x70;
      d[i + 2] = 0x70;
      d[i + 3] = 255;
    }
  }

  // TODO check for support
  function getBuffer4Coord (x, y) {
    return (y * width + x) * 4;
  }

  function drawColumn (d, x, drawStart, drawEnd, color) {
    // color = RGBA
    for (let y = drawStart; y < drawEnd; y++) {
      let coord = getBuffer4Coord(x, y);
      d[coord] = (color >>> 24) & 0xff; // Red
      d[coord + 1] = (color >> 16) & 0xff; // Green
      d[coord + 2] = (color >> 8) & 0xff; // Blue
      d[coord + 3] = 255; // Alpha
    }
  }

  window.requestAnimationFrame(renderFrame);
}());
