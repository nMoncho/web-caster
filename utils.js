const U = (function () {
  'use strict';

  function isLittleEndian() {
    var b = new ArrayBuffer(4);
    var a = new Uint32Array(b);
    var c = new Uint8Array(b);
    a[0] = 0xdeadbeef;
    if (c[0] == 0xef) { isLittleEndian = function() {return true }; return true; }
    if (c[0] == 0xde) { isLittleEndian = function() {return false }; return false; }
    throw new Error('Unknown endianness');
  }

  function loadImage (tagId, want32) {
    const img = document.getElementById(tagId);
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctxt = c.getContext('2d')
    ctxt.drawImage(img, 0, 0);
    let imageData = ctxt.getImageData(0, 0, img.width, img.height);
    if (want32) {
        imageData = new Uint32Array(imageData.data.buffer, 0);
        if (isLittleEndian) {
          imageData = reverseUint32(imageData);
        }
    }

    return {
      imageData: imageData,
      data: imageData.data,
      width: img.width,
      height: img.height
    }
  }

  function reverseUint32 (uint32) {
    return uint32.map(x => ( (x << 24) | ((x & 0xff00) << 8) | ((x & 0xff0000) >>> 8) | (x >>> 24) ));
  }

  Array.prototype.transpose = function () {
    let trans = [];
    let height = this.length;
    let width = this[0].length;
    for (let x = 0; x < width; x++) {
      let row = [];
      for (let y = 0; y < height; y++) {
        row.push(this[y][x]);
      }
      trans.push(row);
    }
    return trans;
  }

  return {
    isLittleEndian: isLittleEndian(),
    loadImage: loadImage
  }
}());
