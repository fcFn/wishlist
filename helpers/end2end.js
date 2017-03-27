export function selectByText(text) {
  return `new UiSelector().text("${text}")`;
};

export function closeHelpModal(wd) {
  return wd
  .waitForElementByAndroidUIAutomator(selectByText('Close'))
  .then((element) => element.tap());
}
