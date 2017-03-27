const RN = require('react-native');

RN.AppState.removeEventListener = function() {};
RN.BackAndroid.removeEventListener = jest.fn();

module.exports = RN;
