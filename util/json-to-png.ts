import Jimp from 'jimp';

export interface ConvertOptions {
  [key: string]: unknown;
}

const charCodeMapping: { [key: number]: [number, number] } = {
  32: [15, 241],
  33: [30, 226],
  34: [45, 211],
  35: [60, 196],
  36: [75, 181],
  37: [90, 166],
  38: [105, 151],
  39: [120, 136],
  40: [135, 121],
  41: [150, 106],
  42: [165, 91],
  43: [180, 76],
  44: [195, 61],
  45: [210, 46],
  46: [225, 31],
  47: [240, 16],
  48: [19, 236],
  49: [34, 221],
  50: [49, 206],
  51: [64, 191],
  52: [79, 176],
  53: [94, 161],
  54: [109, 146],
  55: [124, 131],
  56: [139, 116],
  57: [154, 101],
  58: [169, 86],
  59: [184, 71],
  60: [199, 56],
  61: [214, 41],
  62: [229, 26],
  63: [244, 11],
  64: [59, 216],
  65: [74, 201],
  66: [89, 186],
  67: [104, 171],
  68: [119, 156],
  69: [134, 141],
  70: [149, 126],
  71: [164, 111],
  72: [179, 96],
  73: [194, 81],
  74: [209, 66],
  75: [224, 51],
  76: [239, 36],
  77: [18, 221],
  78: [33, 206],
  79: [48, 191],
  80: [63, 176],
  81: [78, 161],
  82: [93, 146],
  83: [108, 131],
  84: [123, 116],
  85: [138, 101],
  86: [153, 86],
  87: [168, 71],
  88: [183, 56],
  89: [198, 41],
  90: [213, 26],
  91: [228, 11],
  92: [243, 252],
  93: [14, 237],
  94: [29, 222],
  95: [44, 207],
  96: [59, 192],
  97: [74, 177],
  98: [89, 162],
  99: [104, 147],
  100: [119, 132],
  101: [134, 117],
  102: [149, 102],
  103: [164, 87],
  104: [179, 72],
  105: [194, 57],
  106: [209, 42],
  107: [224, 27],
  108: [239, 12],
  109: [20, 242],
  110: [35, 227],
  111: [50, 212],
  112: [65, 197],
  113: [80, 182],
  114: [95, 167],
  115: [110, 152],
  116: [125, 137],
  117: [140, 122],
  118: [155, 107],
  119: [170, 92],
  120: [185, 77],
  121: [200, 62],
  122: [215, 47],
  123: [230, 32],
  124: [245, 17],
  125: [200, 56],
  126: [215, 41]
};

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

function getPixelColor(charCode: number): Array<number> {
  return [charCodeMapping[charCode][0], charCodeMapping[charCode][1]];
}

function writePixels(image: any, str: string): any {
    let charArray = str.split('');
    const length = charArray.length.toString().split('');
    let y = 0;
    for (let i = 0; i < length.length; i+=2) {
        const charCode = length[i].charCodeAt(0);
        const charCodeTwo = length[i + 1] ? length[i + 1].charCodeAt(0) : 0;
        const color = getPixelColor(charCode);
        const colorTwo = getPixelColor(charCodeTwo);
        image.setPixelColor(Jimp.rgbaToInt(color[0], color[1], colorTwo[0], colorTwo[1]), y, 0);
    }
    y++;
    const size = calculateSize(str);
    let x = 0;
    for (let i = 0; i < charArray.length; i += 2) {
        const charCode = charArray[i].charCodeAt(0);
        const charCodeTwo = charArray[i + 1] ? charArray[i + 1].charCodeAt(0) : 0;
        const color = getPixelColor(charCode);
        const colorTwo = getPixelColor(charCodeTwo);
        image.setPixelColor(Jimp.rgbaToInt(color[0], color[1], colorTwo[0], colorTwo[1]), x, y);
        x++;
        if (x >= size) {
            x = 0;
            y++;
        }
    }
    return image;
}


export default convert;