import {selectByText, closeHelpModal} from '../../helpers/end2end.js';

const driver = require('wd');

// End2end tests take a lot of
// time so we have to increase the default async timeout
jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;

describe('Unsaved changes', function() {
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

  it('are asked about before creating a new list', () => wd
    .waitForElementByAndroidUIAutomator(selectByText('⊕'))
    .then((element) => element.tap())
    .then(() => wd.elementByAccessibilityId('AddEditItemTextInput'))
    .then((element) => element.sendKeys('TestItem#2'))
    .then(() => wd.pressDeviceKey(66))
    .then(() => wd
    .elementByAndroidUIAutomator(selectByText('TestItem#2')))
    .then(() => wd.elementByAndroidUIAutomator(selectByText('⊕')))
    .then((element) => element.flick(0, 10, 10))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('New list')))
    .then((element) => element.tap())
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Cancel')))
    .then((element) => element.tap()));

  it('are asked about before switching to QR reading', () => wd
    .elementByAndroidUIAutomator(selectByText('⊕'))
    .then((element) => element.tap())
    .then(() => wd.elementByAccessibilityId('AddEditItemTextInput'))
    .then((element) => element.sendKeys('TestItem#2'))
    .then(() => wd.pressDeviceKey(66))
    .then(() => wd
    .elementByAndroidUIAutomator(selectByText('TestItem#2')))
    .then(() => wd.elementByAndroidUIAutomator(selectByText('⊕')))
    .then((element) => element.flick(0, 10, 10))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Read QR')))
    .then((element) => element.tap())
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Cancel')))
    .then((element) => element.tap()));

  it('are asked about before loading a list', () => wd
    .elementByAndroidUIAutomator(selectByText('⊕'))
    .then((element) => element.tap())
    .then(() => wd.elementByAccessibilityId('AddEditItemTextInput'))
    .then((element) => element.sendKeys('TestItem#2'))
    .then(() => wd.pressDeviceKey(66))
    .then(() => wd
    .elementByAndroidUIAutomator(selectByText('TestItem#2')))
    .then(() => wd.elementByAndroidUIAutomator(selectByText('⊕')))
    .then((element) => element.flick(0, 10, 10))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Load list')))
    .then((element) => element.tap())
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Cancel')))
    .then((element) => element.tap()));
});
