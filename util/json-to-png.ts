import jimp from 'jimp';

const BYTES_PER_CHAR = 4;
const HEADER_LENGTH = 14;
const INFO_LENGTH = 40;
const SIGNATURE = 'BM';

export interface ConvertOptions {
  [key: string]: unknown;
}

export async function convert(obj: ConvertOptions): Promise<Buffer> {
  const strObject = JSON.stringify(obj);
  const bufferSize = getBufferSize(strObject);
  const buffArray = new Uint8Array(bufferSize);
  let ind = writeHeaders(0, buffArray, strObject);
  writePixels(ind, buffArray, strObject);

  const image = await jimp.read(Buffer.from(buffArray.buffer));
  return image.getBufferAsync(jimp.MIME_PNG);
}

function getHeightNeeded(str: string): number {
  return Math.min(Math.ceil(Math.sqrt(Math.ceil((str.length * BYTES_PER_CHAR + 4) / 3))), 64);
}

function getWidthNeeded(str: string): number {
  return Math.ceil(getHeightNeeded(str) / 4) * 4;
}

function writeHeaders(start: number, buffArray: Uint8Array, strObject: string): number {
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

function writePixels(start: number, buffArray: Uint8Array, strObject: string): void {
  const w = getWidthNeeded(strObject);
  const h = getHeightNeeded(strObject);
  const bytes = [...uint32ToUint8Array(strObject.length)];
  let x = -1, cur = 0, arrayIndex = start;
  for (let ind = 0; ind < h * w; ind++) {
    if (++x >= w) {
        x = 0;
    }
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

function uint32ToUint8Array(val: number): number[] {
  return [val >>> 0, val >>> 8, val >>> 16, val >>> 24];
}

function getBufferSize(str: string): number {
  return HEADER_LENGTH + INFO_LENGTH + getWidthNeeded(str) * getHeightNeeded(str) * 3;
}

export default convert;