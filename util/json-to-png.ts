import jimp from 'jimp';

export const BYTES_PER_CHAR = 4;
export const HEADER_LENGTH = 14;
export const INFO_LENGTH = 40;
export const SIGNATURE: 'BM' = 'BM';

export default async function convert(obj: Record<string, unknown>): Promise<Buffer> {
  const strObject = JSON.stringify(obj);
  const bufferSize = getBufferSize(strObject);
  const buffArray = new Uint8Array(bufferSize);
  let ind = writeHeaders(0, buffArray, strObject);
  await writePixelsAsync(ind, buffArray, strObject);

  return jimp.read(Buffer.from(buffArray.buffer))
    .then((image) => image.getBufferAsync(jimp.MIME_PNG));
}

function getHeightNeeded(str: string): number {
  return Math.ceil(Math.sqrt(Math.ceil((str.length * BYTES_PER_CHAR + 4) / 3)));
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

async function writePixelsAsync(start: number, buffArray: Uint8Array, strObject: string): Promise<void> {
  const w = getWidthNeeded(strObject);
  const h = getHeightNeeded(strObject);
  const bytes = new Uint8Array(4);
  let x = -1, cur = 0, arrayIndex = start;
  for (let ind = 0; ind < h * w; ind++) {
    if (++x >= w) {
        x = 0;
    }
    if (x < h) {
      if (bytes[3] === 0) {
        if (cur < strObject.length) {
          const charCode = strObject.charCodeAt(cur++);
          bytes[0] = charCode & 0xFF;
          bytes[1] = (charCode >> 8) & 0xFF;
          bytes[2] = (charCode >> 16) & 0xFF;
          bytes[3] = (charCode >> 24) & 0xFF;
        } else {
          bytes[0] = 0;
          bytes[1] = 0;
          bytes[2] = 0;
          bytes[3] = 0;
        }
      }
      buffArray.set(bytes.subarray(0, 3), arrayIndex);
      arrayIndex += 3;
      bytes[3]--;
    } else {
      buffArray.set([0, 0, 0], arrayIndex);
      arrayIndex += 3;
    }
  }
}

function uint32ToUint8Array(val: number): number[] {
  return [val >> 0, val >> 8, val >> 16, val >> 24].map(x => x & 0xFF);
}

function getBufferSize(str: string): number {
  return HEADER_LENGTH + INFO_LENGTH + getWidthNeeded(str) * getHeightNeeded(str) * 3;
}