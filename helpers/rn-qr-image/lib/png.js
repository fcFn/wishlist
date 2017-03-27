'use strict';

const Buffer = require('buffer/').Buffer;
const pako = require('pako');

let crc32 = require('./crc32');

let PNG_HEAD = new Buffer([137, 80, 78, 71, 13, 10, 26, 10]);
let PNG_IHDR = new Buffer([0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0]);
let PNG_IDAT = new Buffer([0, 0, 0, 0, 73, 68, 65, 84]);
let PNG_IEND = new Buffer([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);

function png(bitmap, stream) {
  stream.push(PNG_HEAD);

  let IHDR = Buffer.concat([PNG_IHDR]);
  IHDR.writeUInt32BE(bitmap.size, 8);
  IHDR.writeUInt32BE(bitmap.size, 12);
  IHDR.writeUInt32BE(crc32(IHDR.slice(4, -4)), 21);
  stream.push(IHDR);
  let IDAT = Buffer.concat([
    PNG_IDAT,
    Buffer.from(pako.deflate(bitmap.data, {level: 9})),
    new Buffer(4),
  ]);
  IDAT.writeUInt32BE(IDAT.length - 12, 0);
  IDAT.writeUInt32BE(crc32(IDAT.slice(4, -4)), IDAT.length - 4);
  stream.push(IDAT);

  stream.push(PNG_IEND);
  stream.push(null);
}

function bitmap(matrix, size, margin) {
  let N = matrix.length;
  let X = (N + 2 * margin) * size;
  let data = Buffer.alloc((X + 1) * X);
  data.fill(255);
  for (var i = 0; i < X; i++) {
    data[i * (X + 1)] = 0;
  }

  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      if (matrix[i][j]) {
        let offset = ((margin + i) * (X + 1) + (margin + j)) * size + 1;
        data.fill(0, offset, offset + size);
        for (var c = 1; c < size; c++) {
          data.copy(data, offset + c * (X + 1), offset, offset + size);
        }
      }
    }
  }

  return {
    data: data,
    size: X,
  };
}

module.exports = {
  bitmap: bitmap,
  png: png,
};
