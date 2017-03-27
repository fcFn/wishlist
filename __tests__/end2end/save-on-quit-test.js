import {selectByText, closeHelpModal} from '../../helpers/end2end.js';

const driver = require('wd');

// End2end tests take a lot of
// time so we have to increase the default async timeout
jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;

describe('State between restars', function() {
  let wd;

  beforeAll(() => {
    wd = driver.promiseRemote('127.0.0.1', 4723);
    return wd
      .init({'noReset': true})
      .then(() => wd.resetApp())
      .then(() => closeHelpModal(wd))
      .catch((err) => {
        throw err;
      });
  });

  afterAll(() =>
      wd.resetApp()
      .then(() => wd.quit())
      .catch((err) => {
        throw err;
      }));

  it('is preserved without manual saving', () => wd
  .elementByAndroidUIAutomator(selectByText('⊕'))
  .then((element) => element.tap())
  .then(() => wd.elementByAccessibilityId('AddEditItemTextInput'))
  .then((element) => element.sendKeys('Unsaved item'))
  .then(() => wd.pressDeviceKey(66))
  .then(() => wd.backgroundApp(1))
  .then(() => wd.closeApp())
  .then(() => wd.launchApp())
  .then(() => wd.elementByAndroidUIAutomator(selectByText('Unsaved item'))));
});
