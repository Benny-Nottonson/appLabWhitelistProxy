import jimp from 'jimp';
const BYTES_PER_CHAR = 4;
const HEADER_LENGTH = 14;
const INFO_LENGTH = 40;
const SIGNATURE = 'BM';
export async function convert(obj) {
    const strObject = JSON.stringify(obj);
    const bufferSize = getBufferSize(strObject);
    const buffArray = new Uint8Array(bufferSize);
    let ind = writeHeaders(0, buffArray, strObject);
    writePixels(ind, buffArray, strObject);
    const image = await jimp.read(Buffer.from(buffArray.buffer));
    return image.getBufferAsync(jimp.MIME_PNG);
}
function getHeightNeeded(str) {
    return Math.ceil(Math.sqrt(Math.ceil((str.length * BYTES_PER_CHAR + 4) / 3)));
}
function getWidthNeeded(str) {
    return Math.ceil(getHeightNeeded(str) / 4) * 4;
}
function writeHeaders(start, buffArray, strObject) {
    const widthNeeded = getWidthNeeded(strObject);
    const uint8Array = new Uint8Array(HEADER_LENGTH + INFO_LENGTH);
    uint8Array.set(SIGNATURE.split("").map(ch => ch.charCodeAt(0)), 0);
    uint8Array.set(uint32ToUint8Array(getBufferSize(strObject)), 2);
    uint8Array.set(uint32ToUint8Array(HEADER_LENGTH + INFO_LENGTH), 10);
    uint8Array.set(uint32ToUint8Array(INFO_LENGTH), 14);
    uint8Array.set(uint32ToUint8Array(widthNeeded), 18);
    uint8Array.set(uint32ToUint8Array(-getHeightNeeded(strObject)), 22);
    uint8Array.set([1, 0, 24, 0], 26);
    uint8Array.set([0xff, 0xff, 0xff, 0xff], 46);
    buffArray.set(uint8Array, start);
    return start + uint8Array.length + 12;
}
function writePixels(start, buffArray, strObject) {
    const w = getWidthNeeded(strObject);
    const h = getHeightNeeded(strObject);
    const bytes = new Array(4);
    bytes[3] = 0;
    let x = -1, cur = 0, arrayIndex = start;
    for (let ind = 0; ind < h * w; ind++) {
        if (++x >= w) {
            x = 0;
        }
        if (x < h) {
            if (bytes[3] === 0) {
                if (cur < strObject.length) {
                    const charCode = strObject.charCodeAt(cur++);
                    bytes[0] = charCode & 0xff;
                    bytes[1] = (charCode >> 8) & 0xff;
                    bytes[2] = (charCode >> 16) & 0xff;
                }
                else {
                    bytes[0] = bytes[1] = bytes[2] = 0;
                }
                bytes[3] = 1;
            }
            buffArray[arrayIndex] = bytes.shift();
        }
        else {
            buffArray[arrayIndex] = 0;
        }
        arrayIndex++;
    }
}
function uint32ToUint8Array(val) {
    return [val >>> 0, val >>> 8, val >>> 16, val >>> 24];
}
function getBufferSize(str) {
    return HEADER_LENGTH + INFO_LENGTH + getWidthNeeded(str) * getHeightNeeded(str) * 3;
}
export default convert;
