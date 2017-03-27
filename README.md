# <img src="https://github.com/fcFn/fcFn.github.io/blob/master/images/logos/wishlist_logo.png" style="vertical-align:bottom"> Wishlist for Android

A simple to-do (or rather "to-buy") list app made with [React Native](https://facebook.github.io/react-native). It can generate QR codes from the lists made in it and read those QRs back to swap lists between users. That's pretty much it.

Android KitKat or later supported.

Wishlist is available in English and Russian languages (switches based on the device locale).

<img src="https://github.com/fcFn/fcFn.github.io/blob/master/images/gif_demos/wishlist_demo.gif" />

## Installing

Build and install the APK on your device or emulator.

A prebuilt APK is available [here](https://github.com/fcFn/wishlist/releases).

## Controls

- To add an item, press the ⊕ button at the bottom of the list.
- To remove an item, swipe it to the left.
- To edit an item, press it and hold.
- To show additional options, press and hold the ⊕ button.
- Additional options:
  - Generate QR: generates a QR Code from the current list.
  - Read QR: reads a QR Code generated in Wishlist and creates a list out of it.
  - Load list: loads a previously saved list.
  - Save list: saves the current list, overwriting the previously saved list.
  - New list: creates a new list.
  - Help: shows help window.

## Building

* You will need React Native CLI: `$ npm install -g react-native-cli`;
* `$ npm install` to install dependencies;
* `$ react-native run-android` (make sure a device is connected to ADB) for a quick start;
* or `$ cd android && ./gradlew assembleDebug` to simply build the debug APK (without bunding JS assets, so you will still need to run React Native packager).


## Testing

Both unit and end-to-end testing is done via [Jest](https://facebook.github.io/jest).

End-to-end testing is done via WebDriver, specifically [Appium](https://appium.com), so you might need to configure Appium first.

`$ npm test` will run unit tests only.

`$ npm test-end` will run end-to-end tests only.

## Additional notes

There is only one save file available to the user (it also saves between exits, though). Saving will overwrite the previous save file without a warning. As I intended to use it to write down (possibly for another person) what to buy on a shop trip, I don't think multiple save files are necessary.
