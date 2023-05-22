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

function writePixels(image: Jimp, str: string): any {
    let charArray: string[] = str.split('');
    const length: string[] = charArray.length.toString().split('');
    let y: number = 0;
    for (let i = 0; i < length.length; i += 3) {
        const charCode: number = length[i] ? length[i].charCodeAt(0) : 255;
        const charCodeTwo: number = length[i + 1] ? length[i + 1].charCodeAt(0) : 255;
        const charCodeThree: number = length[i + 2] ? length[i + 2].charCodeAt(0) : 255;
        image.setPixelColor(Jimp.rgbaToInt(charCode, charCodeTwo, charCodeThree, 255), 0, y);
    }
    y++;
    const size = calculateSize(str);
    let x:number = 0;
    for (let i:number = 0; i < charArray.length; i += 3) {
      const charCode:number = charArray[i] ? charArray[i].charCodeAt(0) : 255;
      const charCodeTwo:number = charArray[i + 1] ? charArray[i + 1].charCodeAt(0) : 255;
      const charCodeThree:number = charArray[i + 2] ? charArray[i + 2].charCodeAt(0) : 255;
      image.setPixelColor(Jimp.rgbaToInt(charCode, charCodeTwo, charCodeThree, 255), x, y);
        x++;
        if (x >= size) {
            x = 0;
            y++;
        }
    }
    return image;
}


export default convert;