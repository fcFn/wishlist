// Serialize item object, "transliterate" russian
// text to ASCII (not real transliteration as
// it uses control characters to represent what
// would otherwise require two characters and
// non-applicable English characters such as W and Q)

// All this pain is needed because of some glitch
// in one of the third-party QR components that won't allow
// to use binary data in the codes.

const pako = require('pako');
const utf8 = require('./utf8/utf8');
const Buffer = require('buffer/').Buffer;

let translitMapping = {
  ruEn: {
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'е': 'e',
    'ё': '\x01',
    'ж': 'j',
    'з': 'z',
    'и': 'i',
    'й': 'y',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'h',
    'ц': 'c',
    'ч': 'x',
    'ш': 'w',
    'щ': '\x02',
    'ъ': '\x03',
    'ы': '\x04',
    'ь': '\x05',
    'э': '\x06',
    'ю': '\x07',
    'я': 'q',
    'А': 'A',
    'Б': 'B',
    'В': 'V',
    'Г': 'G',
    'Д': 'D',
    'Е': 'E',
    'Ё': '\x08',
    'Ж': 'J',
    'З': 'Z',
    'И': 'I',
    'Й': 'Y',
    'К': 'K',
    'Л': 'L',
    'М': 'M',
    'Н': 'N',
    'О': 'O',
    'П': 'P',
    'Р': 'R',
    'С': 'S',
    'Т': 'T',
    'У': 'U',
    'Ф': 'F',
    'Х': 'H',
    'Ц': 'C',
    'Ч': 'X',
    'Ш': 'W',
    'Щ': '\x09',
    'Ъ': '\x10',
    'Ы': '\x11',
    'Ь': '\x12',
    'Э': '\x13',
    'Ю': '\x14',
    'Я': 'Q',
  },
  enRu: {
    'a': 'а',
    'b': 'б',
    'v': 'в',
    'g': 'г',
    'd': 'д',
    'e': 'е',
    '\x01': 'ё',
    'j': 'ж',
    'z': 'з',
    'i': 'и',
    'y': 'й',
    'k': 'к',
    'l': 'л',
    'm': 'м',
    'n': 'н',
    'o': 'о',
    'p': 'п',
    'r': 'р',
    's': 'с',
    't': 'т',
    'u': 'у',
    'f': 'ф',
    'h': 'х',
    'c': 'ц',
    'x': 'ч',
    'w': 'ш',
    '\x02': 'щ',
    '\x03': 'ъ',
    '\x04': 'ы',
    '\x05': 'ь',
    '\x06': 'э',
    '\x07': 'ю',
    'q': 'я',
    'A': 'А',
    'B': 'Б',
    'V': 'В',
    'G': 'Г',
    'D': 'Д',
    'E': 'Е',
    '\x08': 'Ё',
    'J': 'Ж',
    'Z': 'З',
    'I': 'И',
    'Y': 'Й',
    'K': 'К',
    'L': 'Л',
    'M': 'М',
    'N': 'Н',
    'O': 'О',
    'P': 'П',
    'R': 'Р',
    'S': 'С',
    'T': 'Т',
    'U': 'У',
    'F': 'Ф',
    'H': 'Х',
    'C': 'Ц',
    'X': 'Ч',
    'W': 'Ш',
    '\x09': 'Щ',
    '\x10': 'Ъ',
    '\x11': 'Ы',
    '\x12': 'Ь',
    '\x13': 'Э',
    '\x14': 'Ю',
    'Q': 'Я',
  },
};

function flattenItems(itemsObject) {
  let enCharsRe = /[a-zA-z]/;
  let flatItems = itemsObject.map((e) => (!enCharsRe.test(e.name)
    ? '\x15'
    : '\x16') + (e.name) + (e.done
    ? '$'
    : ''));
  if (flatItems[0][0] === '\x16') {
    flatItems[0] = flatItems[0].slice(1);
  }
  return flatItems;
}

function unflattenItems(itemsString) {
  let items = itemsString;
  let itemList = [];
  if (items[0] === '\x15') {
    items = 'r' + items.slice(1);
  }
  items = items
    .replace(/\x15/g, '\x15r')
    .split('\x15');
  items.forEach((e) => {
    if (e.includes('\x16')) {
      let parts = e.split('\x16');
      itemList.push(...parts);
    } else {
      itemList.push(e);
    }
  });
  return itemList;
}

function translitItems(flatItems) {
  return flatItems.map((e) => e[0] === '\x15'
    ? transliterate(e, 'ruEn')
    : e);
}

function untranslitItems(itemList) {
  return itemList.map((e) => e[0] === 'r'
    ? transliterate(e.slice(1), 'enRu')
    : e);
}

function restoreItems(itemList) {
  return itemList.map((e) => {
    let done = e.slice(-1) === '$'
      ? true
      : false;
    e = done
      ? e.slice(0, -1)
      : e;
    return {name: e, done: done};
  });
}

function transliterate(string, mode) {
  if (mode !== 'enRu' && mode !== 'ruEn') {
    throw new Error('Invalid transliterate option (use enRu or ruEn)');
  }
  let array = string.split('');
  return array.map((letter) =>
    translitMapping[mode].hasOwnProperty(letter)
      ? translitMapping[mode][letter]
      : letter
  ).join('');
}

function packItems(itemsObject) {
  let pack = flattenItems(itemsObject);
  pack = translitItems(pack).join('');
  pack = pako.deflate(pack, {level: 9});
  return convertToNumeric(pack);
}

function unpackItems(string) {
  let unpack = convertFromNumeric(string);
  unpack = pako.inflate(unpack);
  unpack = utf8.decode(String.fromCharCode.apply(null, unpack));
  unpack = unflattenItems(unpack);
  unpack = untranslitItems(unpack);
  unpack = restoreItems(unpack);
  return unpack;
}

function convertToNumeric(byteArray) {
  return Array
    .from(byteArray)
    .map((e) => {
      e = '' + e;
      if (e.length === 1) {
        return '00' + e;
      } else if (e.length === 2) {
        return '0' + e;
      }
      return e;
    })
    .join('');
}

function convertFromNumeric(string) {
  let denumerized = [];
  for (let i = 0; i < string.length;) {
    denumerized.push(parseInt(string.slice(i, i + 3)));
    i += 3;
  }
  return Buffer.from(denumerized);
}

module.exports = {
  packItems: packItems,
  unpackItems: unpackItems,
  _transliterate: transliterate,
};
