import {selectByText, closeHelpModal} from '../../helpers/end2end.js';

const driver = require('wd');

// End2end tests take a lot of
// time so we have to increase the default async timeout
jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;

describe('Item manipulation', function() {
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

  describe('tapping an item', () => {
    it('checks an unchecked item', () => wd
      .waitForElementByAndroidUIAutomator(selectByText('Item#2'))
      .then((element) => element.tap())
      .then(() => wd.
        elementByAndroidUIAutomator(selectByText('✓ Item#2'))));

    it('unchecks a checked item', () => wd
      .elementByAndroidUIAutomator(selectByText('✓ Item#2'))
      .then((element) => element.tap())
      .then(() => wd.
        elementByAndroidUIAutomator(selectByText('Item#2'))));
  });

  describe('manipulating an item', () => {
    it('removes an item', () => wd
      .elementByAndroidUIAutomator(selectByText('Item#2'))
      .then((element) => element.flick(-500, 0, 100))
      .then(() => wd
        .elementByAndroidUIAutomatorIfExists(selectByText('Item#2')))
      .then((element) => expect(element).toBeUndefined()));

    it('doesn\'t allow adding duplicate items', () => wd
      .elementByAndroidUIAutomator(selectByText('⊕'))
      .then((element) => element.tap())
      .then(() => wd.elementByAccessibilityId('AddEditItemTextInput'))
      .then((element) => element.sendKeys('Item#7'))
      .then(() => wd.pressDeviceKey(66))
      .then(() => wd
        .elementsByAndroidUIAutomator(selectByText('Item#7')))
      .then((elements) => expect(elements.length).toBe(1)));

    // Loading and saving to prevent test items deletion upon adding
    // new item (so we are sure that the list is scrolled to the bottom
    // and the newly added item is visible)
    it('adds an item', () => wd
      .elementByAndroidUIAutomator(selectByText('⊕'))
      .then((element) => element.flick(0, 10, 10))
      .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Save list')))
      .then((element) => element.tap())
      .then(() => wd.elementByAndroidUIAutomator(selectByText('⊕')))
      .then((element) => element.flick(0, 10, 10))
      .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Load list')))
      .then((element) => element.tap())
      .then(() => wd.elementByAndroidUIAutomator(selectByText('⊕')))
      .then((element) => element.tap())
      .then(() => wd.elementByAccessibilityId('AddEditItemTextInput'))
      .then((element) => element.sendKeys('TestItemUnedited'))
      .then(() => wd.pressDeviceKey(66))
      .then(() => wd
        .elementByAndroidUIAutomator(selectByText('TestItemUnedited'))));

    it('edits an item', () => wd
      .elementByAndroidUIAutomator(selectByText('TestItemUnedited'))
      .then((element) => element.flick(0, 10, 7))
      .then(() => wd.elementByAccessibilityId('AddEditItemTextInput'))
      .then((element) => element.setText('TestItem'))
      .then(() => wd.pressDeviceKey(66))
      .then(() => wd.elementByAndroidUIAutomator(selectByText('TestItem')))
      .then(() => wd
        .elementByAndroidUIAutomatorIfExists(selectByText('TestItemUnedited')))
      .then((element) => expect(element).toBeUndefined()));
  });
});
