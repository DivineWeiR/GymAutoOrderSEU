const pixels = require("image-pixels");
const output = require("image-output");

const BACKCOLOR = 255;
const TEXTCOLOR = 0;
const OriImgNum1_Left = 7;
const OriImgNum1_Upper = 3;
const OriImgNum1_Right = 16;
const OriImgNum1_Lower = 16;
const OriImgNums_Interval = 13;
const ModelWidth = 9;
const ModelHeight = 13;
const ValidateWidth = 60;
const ValidateHeight = 20;
const Deviation = 50;
const N = 100000;

async function loadImage(url) {
    let { data, width, height } = await pixels(url);
    // console.log(width, height);
    // console.log(data);
    let bData = binarized(data);
    // output({ data: bData, width, height }, "binarized.jpg");
    let matrix = array2Matrix(bData, width, height);
    // console.log(matrix);
    return matrix;
    // return bData;
}

function binarized(pixelsData) {
    binarizedData = Uint8Array.from(pixelsData);
    const threshold = 140;
    let len = pixelsData.length / 4;
    // let binarizedData = new Array(len);
    for (let i = 0; i < len; i++) {
        if (
            pixelsData[4 * i] > 140 ||
            pixelsData[4 * i + 1] > 140 ||
            pixelsData[4 * i + 2] > 140
        ) {
            binarizedData[i] = BACKCOLOR;
        } else {
            binarizedData[i] = TEXTCOLOR;
        }
    }

    return binarizedData;
}

function array2Matrix(data, width, height) {
    let array = Array.from(data);
    let matrix = [];
    for (let i = 0; i < height; i++) {
        let temp = array.slice(i * width, i * width + width);
        matrix.push(temp);
    }
    return matrix;
}
async function getNums(bData) {
    let left = OriImgNum1_Left;
    let upper = OriImgNum1_Upper;

    let nums = "";
    let num = 0;
    for (let i = 0; i < 4; i++) {
        let max = 0;
        for (let j = 0; j < 10; j++) {
            let similarity = 0;
            let mData = await loadImage(`Models/${j}.jpg`);
            for (let h = 0; h < ModelHeight; h++) {
                for (let w = 0; w < ModelWidth; w++) {
                    if (
                        Math.abs(mData[h][w] - bData[h + upper][w + left]) <
                        Deviation
                    ) {
                        similarity += 1;
                    } else {
                        similarity -= 1;
                    }
                }
            }
            if (similarity > max) {
                max = similarity;
                num = j;
            }
        }

        left += OriImgNums_Interval;
        nums = nums.concat(num);
    }
    return nums;
}

async function getResultFromImage(url) {
    let bData = await loadImage(url);
    let nums = await getNums(bData);

    // console.log(nums);
    return nums;
}

// loadImage("validate.jpg");
// loadImage("Models/1.jpg");

getResultFromImage("validate.jpg");

module.exports = getResultFromImage;
