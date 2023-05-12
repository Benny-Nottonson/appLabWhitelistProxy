import jimp from 'jimp';

export const BYTES_PER_CHAR = 4;
export const HEADER_LENGTH = 14;
export const INFO_LENGTH = 40;
export const SIGNATURE = 'BM';

export default function convert(obj) {
  const strObject = JSON.stringify(obj);
  const buffArray = new Uint8Array(getBufferSize(strObject));
  let ind = writeHeaders(0, buffArray, strObject);
  writePixels(ind, buffArray, strObject);

  return jimp.read(Buffer.from(buffArray.buffer))
    .then((image) => image.getBufferAsync(jimp.MIME_PNG));
}

function getHeightNeeded(str) {
  return Math.ceil(Math.sqrt(Math.ceil((str.length * BYTES_PER_CHAR + 4) / 3)));
}

function getWidthNeeded(str) {
  return Math.ceil(getHeightNeeded(str) / 4) * 4;
}

function writeHeaders(start, buffArray, strObject) {
  const widthNeeded = getWidthNeeded(strObject);
  const uint8Array = new Uint8Array([
    ...SIGNATURE.split("").map(ch => ch.charCodeAt(0)),
    ...uint32ToUint8Array(getBufferSize(strObject)),
    0, 0, 0, 0,
    ...uint32ToUint8Array(HEADER_LENGTH + INFO_LENGTH),
    ...uint32ToUint8Array(INFO_LENGTH),
    ...uint32ToUint8Array(widthNeeded),
    ...uint32ToUint8Array(-getHeightNeeded(strObject)),
    1, 0, 24, 0,
    0, 0, 0, 0,
    0xff, 0xff, 0xff, 0xff,
    0, 0, 0, 0
  ]);
  buffArray.set(uint8Array, start);
  return start + uint8Array.length + 12;
}

function writePixels(start, buffArray, strObject) {
  let arrayIndex = start;
  const w = getWidthNeeded(strObject);
  const h = getHeightNeeded(strObject);
  let cur = 0;
  const bytes = [...uint32ToUint8Array(strObject.length)];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < h) {
        if (bytes.length < 3) {
          if (cur < strObject.length) {
            bytes.push(...uint32ToUint8Array(strObject.charCodeAt(cur++)));
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
}

function uint32ToUint8Array(val) {
  return [val >> 0, val >> 8, val >> 16, val >> 24].map(x => x & 0xFF);
}

function getBufferSize(str) {
  return HEADER_LENGTH + INFO_LENGTH + getWidthNeeded(str) * getHeightNeeded(str) * 3;
}