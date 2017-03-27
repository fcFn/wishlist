export default function makeTestIDs(id) {
  if (__DEV__) {
    return {
      accessibilityLabel: id,
      testID: id,
    };
  }
}
