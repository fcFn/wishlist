import {selectByText} from '../../helpers/end2end.js';

const driver = require('wd');

// End2end tests take a lot of
// time so we have to increase the default async timeout
jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;

describe('General UI', function() {
  let wd;

  beforeAll(() => {
    wd = driver.promiseRemote('127.0.0.1', 4723);
    return wd
      .init()
      .catch((err) => {
        throw err;
      });
  });

  afterAll(() => wd
      .quit()
      .catch((err) => {
        throw err;
      }));

  it('displays the first run help modal', () => wd
      .waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Hello and welcome to Wishlist!")')
    );

  it('closes the first run help modal', () => wd
      .elementByAndroidUIAutomator(selectByText('Close'))
      .then((element) => element.tap())
      .then(() => wd.elementByAndroidUIAutomatorIfExists(selectByText('Close')))
      .then((element) => expect(element).toBeUndefined()));

  it('loads default items', () => wd
    .elementByAndroidUIAutomator(selectByText('Item#0'))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Item#10'))));

  // This one is fragile and sometimes fails for no apparent reason
  it('scrolls the list properly', () => wd
      .elementByAndroidUIAutomator(selectByText('Item#6'))
      .then((element) => element.flick(0, -200, 95))
      .then(() => wd
        .elementByAndroidUIAutomator(selectByText('Item#13')))
      .then(() => wd.
        elementByAndroidUIAutomatorIfExists(selectByText('Item#14')))
      .then((element) => expect(element).toBeUndefined()));

  it('scrolls to the bottom of the list', () => wd
    .elementByAndroidUIAutomator(selectByText('Item#4'))
    .then((element) => element.flick(0, -5000, 100))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Item#30'))));

  it('scrolls to the top of the list', () => wd
    .elementByAndroidUIAutomator(selectByText('Item#26'))
    .then((element) => element.flick(0, 5000, 100))
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Item#0'))));

  // This one is fragile and sometimes fails for no apparent reason
  it('scrolls to the bottom of the list when keyboard shows', () => wd
    .elementByAndroidUIAutomator(selectByText('⊕'))
    .then((element) => element.tap())
    .then(() => wd
      .elementByAndroidUIAutomator(selectByText('Item#30')))
    .then(() => wd.pressDeviceKey(66)));
});
