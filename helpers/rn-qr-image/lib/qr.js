'use strict';

const Buffer = require('buffer/').Buffer;

let QR = require('./qr-base').QR;
let png = require('./png');
let vector = require('./vector');

let fn_noop = function() {};

let BITMAP_OPTIONS = {
  parse_url: false,
  ec_level: 'M',
  size: 5,
  margin: 4,
  customize: null,
};

let VECTOR_OPTIONS = {
  parse_url: false,
  ec_level: 'M',
  margin: 1,
  size: 0,
};

function get_options(options, force_type) {
  if (typeof options === 'string') {
    options = {'ec_level': options};
  } else {
    options = options || {};
  }
  let _options = {
    type: String(force_type || options.type || 'png').toLowerCase(),
  };

  let defaults = _options.type == 'png' ? BITMAP_OPTIONS : VECTOR_OPTIONS;

  for (let k in defaults) {
    _options[k] = k in options ? options[k] : defaults[k];
  }

  return _options;
}

function qr_image(text, options) {
  throw new Error('Use imageSync with React Native instead');
}

function qr_image_sync(text, options) {
  options = get_options(options);

  let matrix = QR(text, options.ec_level, options.parse_url);
  let stream = [];
  let result;

  switch (options.type) {
  case 'svg':
  case 'pdf':
  case 'eps':
    vector[options.type](matrix, stream, options.margin, options.size);
    result = stream.filter(Boolean).join('');
    break;
  case 'png':
  default:
    var bitmap = png.bitmap(matrix, options.size, options.margin);
    if (options.customize) {
      options.customize(bitmap);
    }
    png.png(bitmap, stream);
    result = Buffer.concat(stream.filter(Boolean));
  }

  return result;
}

function svg_object(text, options) {
  options = get_options(options, 'svg');

  let matrix = QR(text, options.ec_level);
  return vector.svg_object(matrix, options.margin);
}

module.exports = {
  matrix: QR,
  image: qr_image,
  imageSync: qr_image_sync,
  svgObject: svg_object,
};
