import Jimp from 'jimp';

export interface ConvertOptions {
  [key: string]: unknown;
}

export async function convert(obj: ConvertOptions): Promise<Buffer> {
  const strObject = JSON.stringify(obj);

  const size = calculateSize(strObject);

  const image =  new Jimp(size, size + 1, 'white', (err: Error) => {
    if (err) throw err
  });

  let finalImage = writePixels(image, strObject);

  return finalImage.getBufferAsync(Jimp.MIME_PNG);
}

function calculateSize(str: string): number {
  return Math.ceil(Math.sqrt(str.length / 3));
}

function getPixelColor(code: number): [number, number] {
  if (code < 32 || code > 126) {
    throw new Error('The input code must be in the range 32-126.');
  }

  const offset = 256 - Math.ceil((512 - (126 - 32 + 1)) / 2);
  const value1 = (code - 32) * 2 + offset;
  const value2 = (code - 32) * 2 + offset + 1;

  return [value1, value2];
}

function writePixels(image: any, str: string): any {
    let charArray = str.split('');
    const length = charArray.length.toString().split('');
    let y = 0;
    for (let i = 0; i < length.length; i+=3) {
        const charCode = length[i].charCodeAt(0);
        const charCodeTwo = length[i + 1] ? length[i + 1].charCodeAt(0) : 0;
        const colorOne = getPixelColor(charCode);
        const colorTwo = getPixelColor(charCodeTwo);
        image.setPixelColor(Jimp.rgbaToInt(colorOne[0], colorOne[1], colorTwo[0], colorTwo[1]), y, 0);
    }
    y++;
    const size = calculateSize(str);
    let x = 0;
    for (let i = 0; i < charArray.length; i += 2) {
      const charCode = length[i].charCodeAt(0);
      const charCodeTwo = length[i + 1] ? length[i + 1].charCodeAt(0) : 0;
      const colorOne = getPixelColor(charCode);
      const colorTwo = getPixelColor(charCodeTwo);
      image.setPixelColor(Jimp.rgbaToInt(colorOne[0], colorOne[1], colorTwo[0], colorTwo[1]), x, y);
        x++;
        if (x >= size) {
            x = 0;
            y++;
        }
    }
    return image;
}


export default convert;