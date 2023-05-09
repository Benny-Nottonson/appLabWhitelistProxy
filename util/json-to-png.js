const jimp = require('jimp');

module.exports = {
  BYTES_PER_CHAR: 4,
  HEADER_LENGTH: 14,
  INFO_LENGTH: 40,
  SIGNATURE: 'BM',
  convert: function(obj) {
    const strObject = JSON.stringify(obj);
    const buffArray = new Uint8Array(this.getBufferSize(strObject));
    let ind = this.writeHeaders(0, buffArray, strObject);
    this.writePixels(ind, buffArray, strObject);
  
    return jimp.read(Buffer.from(buffArray.buffer))
      .then((image) => image.getBufferAsync(jimp.MIME_PNG));
  },
  getHeightNeeded: function(str) {
    return Math.ceil(Math.sqrt(Math.ceil((str.length * this.BYTES_PER_CHAR + 4) / 3)));
  },
  getWidthNeeded: function(str) {
    return Math.ceil(this.getHeightNeeded(str) / 4) * 4;
  },
  writeHeaders: function(start, buffArray, strObject) {
    const widthNeeded = this.getWidthNeeded(strObject);
    const uint8Array = new Uint8Array([
      ...this.SIGNATURE.split("").map(ch => ch.charCodeAt(0)),
      ...this.uint32ToUint8Array(this.getBufferSize(strObject)),
      0, 0, 0, 0,
      ...this.uint32ToUint8Array(this.HEADER_LENGTH + this.INFO_LENGTH),
      ...this.uint32ToUint8Array(this.INFO_LENGTH),
      ...this.uint32ToUint8Array(widthNeeded),
      ...this.uint32ToUint8Array(-this.getHeightNeeded(strObject)),
      1, 0, 24, 0,
      0, 0, 0, 0,
      0xff, 0xff, 0xff, 0xff,
      0, 0, 0, 0
    ]);
    buffArray.set(uint8Array, start);
    return start + uint8Array.length + 12;
  },
  writePixels: function(start, buffArray, strObject) {
    let arrayIndex = start;
    const w = this.getWidthNeeded(strObject);
    const h = this.getHeightNeeded(strObject);
    let cur = 0;
    const bytes = [...this.uint32ToUint8Array(strObject.length)];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x < h) {
          if (bytes.length < 3) {
            if (cur < strObject.length) {
              bytes.push(...this.uint32ToUint8Array(strObject.charCodeAt(cur++)));
            } else {
              bytes.push(0, 0, 0, 0);
            }
          }
          buffArray.set(bytes.splice(0, 3), arrayIndex);
          arrayIndex += 3;
        } else {
          buffArray.set([0, 0, 0], arrayIndex);
          arrayIndex += 3;
        }
      }
    }
    if (bytes.length > 0) {
      const len = 3 - bytes.length;
      for (let i = 0; i < len; i++) {
        bytes.push(0);
      }
      buffArray.set(bytes, arrayIndex);
    }
  },
  uint32ToUint8Array(val) {
    return [val >> 0, val >> 8, val >> 16, val >> 24].map(x => x & 0xFF);
  },
  getBufferSize(str) {
    return this.HEADER_LENGTH + this.INFO_LENGTH + this.getWidthNeeded(str) * this.getHeightNeeded(str) * 3;
  }
};