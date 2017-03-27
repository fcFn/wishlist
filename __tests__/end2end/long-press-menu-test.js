import {selectByText, closeHelpModal} from '../../helpers/end2end.js';

const driver = require('wd');

// End2end tests take a lot of
// time so we have to increase the default async timeout
jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;

describe('Long press menu', function() {
  let wd;

  beforeAll(() => {
    wd = driver.promiseRemote('127.0.0.1', 4723);
    return wd
      .init()
      .then(() => closeHelpModal(wd))
      .catch((err) => {
        throw err;
      });
  });

  afterAll(() => wd
      .quit()
      .catch((err) => {
        throw err;
      }));

  describe('menu items', () => {
    it('show', () => wd
    .waitForElementByAndroidUIAutomator(selectByText('⊕'))
    .then((element) => element.flick(0, 10, 10))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Generate QR')))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Read QR')))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Save list')))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Load list')))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('New list')))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Help'))));

    it('close', () => wd
    .elementByAndroidUIAutomator(selectByText('Help'))
    .then((element) => expect(element).toBeDefined())
    .then(() => wd.back())
    .then(() => wd.elementByAndroidUIAutomatorIfExists(selectByText('Help')))
    .then((element) => expect(element).toBeUndefined()));
  });

  describe('"Help" menu item', () => {
    it('displays the help message', () => wd
    .elementByAndroidUIAutomator(selectByText('⊕'))
    .then((element) => element.flick(0, 10, 10))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Help')))
    .then((element) => element.tap())
    .then(() => wd
      .waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Help")')));

    it('closes the help message', () => wd
    .elementByAndroidUIAutomator(selectByText('Close'))
    .then((element) => element.tap())
    .then(() => wd.waitForElementByAndroidUIAutomator(selectByText('⊕'))));
  });

  describe('generate QR code item', () => {
  // The QR and Camera tests should use screenshot comparison to be
  // more useful. Right now they only check that the
  // scene has changed and Image and Camera elements have
  // been rendered.
    it('generates a QR Code', () => wd
    .elementByAndroidUIAutomator(selectByText('⊕'))
    .then((element) => element.flick(0, 10, 10))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Generate QR')))
    .then((element) => element.tap())
    .then(() => wd.elementByAccessibilityId('QRImage')));

    it('closes scene with generated QR code', () => wd
    .elementByAccessibilityId('QRImage')
    .then((element) => expect(element).toBeDefined())
    .then(() => wd.back())
    .then(() => wd.elementByAndroidUIAutomator(selectByText('⊕'))));
  });

  describe('"Read QR code" menu item"', () => {
    it('opens camera for QR reading', () => wd
    .elementByAndroidUIAutomator(selectByText('⊕'))
    .then((element) => element.flick(0, 10, 10))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Read QR')))
    .then((element) => element.tap())
    .then(() => wd.elementByAccessibilityId('Camera')));

    it('closes camera for QR reading', () => wd
    .elementByAccessibilityId('Camera')
    .then(() => wd.back())
    .then(() => wd.elementByAndroidUIAutomator(selectByText('⊕'))));
  });

  describe('"Save list" and "Load list" menu items', () => {
    it('save and load the list', () => wd
      .elementByAndroidUIAutomator(selectByText('⊕'))
      .then((element) => element.tap())
      .then(() => wd.elementByAccessibilityId('AddEditItemTextInput'))
      .then((element) => element.sendKeys('TestItem'))
      .then(() => wd.pressDeviceKey(66))
      .then(() => wd.elementByAndroidUIAutomator(selectByText('TestItem')))
      // Tap an item so we see if it loaded as checked
      .then((element) => element.tap())
      .then(() => wd
        .elementByAndroidUIAutomator(selectByText('⊕')))
      .then((element) => element.flick(0, 10, 10))
      .then(() => wd
        .elementByAndroidUIAutomator(selectByText('Save list')))
      .then((element) => element.tap())
      .then(() => wd
        .elementByAndroidUIAutomator(selectByText('✓ TestItem')))
      .then((element) => element.flick(-500, 0, 100))
      .then(() => wd
        .elementByAndroidUIAutomator(selectByText('The list is empty')))
      .then(() => wd.elementByAndroidUIAutomatorIfExists(selectByText('⊕')))
      .then((element) => element.flick(0, 10, 10))
      .then(() => wd
        .elementByAndroidUIAutomator(selectByText('Load list')))
      .then((element) => element.tap())
      .then(() => wd
        .elementByAndroidUIAutomator(selectByText('✓ TestItem')))
      .then(() => wd
        .elementByAndroidUIAutomatorIfExists(selectByText('The list is empty')))
      .then((element) => expect(element).toBeUndefined()));
  });

  describe('"New list" menu item', () => {
    it('creates a new list', () => wd
        .elementByAndroidUIAutomator(selectByText('⊕'))
        .then((element) => element.flick(0, 10, 10))
        .then(() => wd
          .elementByAndroidUIAutomator(selectByText('New list')))
        .then((element) => element.tap())
        .then(() => wd.elementByAndroidUIAutomatorIfExists(selectByText('OK')))
        .then((element) => {
          if (element) {
            element.tap();
          }
        })
        .then(() => wd
          .elementByAndroidUIAutomator(selectByText('The list is empty')))
        .then(() => wd
          .elementByAndroidUIAutomatorIfExists(selectByText('TestItem')))
        .then((element) => expect(element).toBeUndefined()));
  });
});
