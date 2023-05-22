import Jimp from 'jimp';

export interface ConvertOptions {
  [key: string]: unknown;
}

export async function convert(obj: ConvertOptions): Promise<Buffer> {
  const strObject = JSON.stringify(obj);

  const size = calculateSize(strObject);

  const image =  new Jimp(size, size + 1, 'black', (err: Error) => {
    if (err) throw err
  });

  let finalImage = writePixels(image, strObject);

  return finalImage.getBufferAsync(Jimp.MIME_PNG);
}

function calculateSize(str: string): number {
  return Math.ceil(Math.sqrt(str.length / 3));
}

function writePixels(image: any, str: string): any {
    let charArray = str.split('');
    const length = charArray.length.toString().split('');
    let y = 0;
    for (let i = 0; i < length.length; i += 3) {
        const charCode = length[i] ? length[i].charCodeAt(0) : 0;
        const charCodeTwo = length[i + 1] ? length[i + 1].charCodeAt(0) : 0;
        const charCodeThree = length[i + 2] ? length[i + 2].charCodeAt(0) : 0;
        image.setPixelColor(Jimp.rgbaToInt(charCode, charCodeTwo, charCodeThree, 1), y, 0);
    }
    y++;
    const size = calculateSize(str);
    let x = 0;
    for (let i = 0; i < charArray.length; i += 3) {
      const charCode = length[i] ? length[i].charCodeAt(0) : 0;
      const charCodeTwo = length[i + 1] ? length[i + 1].charCodeAt(0) : 0;
      const charCodeThree = length[i + 2] ? length[i + 2].charCodeAt(0) : 0;
      image.setPixelColor(Jimp.rgbaToInt(charCode, charCodeTwo, charCodeThree, 1), x, y);
        x++;
        if (x >= size) {
            x = 0;
            y++;
        }
    }
    return image;
}


export default convert;