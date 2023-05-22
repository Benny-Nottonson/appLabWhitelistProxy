import Jimp from 'jimp';
export async function convert(obj) {
    const strObject = JSON.stringify(obj);
    const size = calculateSize(strObject);
    const image = new Jimp(size, size + 1, 'black', (err) => {
        if (err)
            throw err;
    });
    let finalImage = writePixels(image, strObject);
    return finalImage.getBufferAsync(Jimp.MIME_PNG);
}
function calculateSize(str) {
    return Math.ceil(Math.sqrt(str.length / 3));
}
function writePixels(image, str) {
    let charArray = str.split('');
    const length = charArray.length.toString().split('');
    let y = 0;
    for (let i = 0; i < length.length; i += 3) {
        const charCode = length[i] ? length[i].charCodeAt(0) : 0;
        const charCodeTwo = length[i + 1] ? length[i + 1].charCodeAt(0) : 0;
        const charCodeThree = length[i + 2] ? length[i + 2].charCodeAt(0) : 0;
        image.setPixelColor(Jimp.rgbaToInt(charCode, charCodeTwo, charCodeThree, 255), y, 0);
    }
    y++;
    const size = calculateSize(str);
    let x = 0;
    for (let i = 0; i < charArray.length; i += 3) {
        const charCode = length[i] ? length[i].charCodeAt(0) : 0;
        const charCodeTwo = length[i + 1] ? length[i + 1].charCodeAt(0) : 0;
        const charCodeThree = length[i + 2] ? length[i + 2].charCodeAt(0) : 0;
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
