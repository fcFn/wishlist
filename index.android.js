// Main component contains the Navigator which displays our various scenes

import React, {Component} from 'react';
import {
  AppRegistry,
  Text,
  View,
  Navigator,
  BackAndroid,
  Image,
} from 'react-native';


import RNFetchBlob from 'react-native-fetch-blob';
import Camera from 'react-native-camera';
import I18n from 'react-native-i18n';

import ListScene from './components/ListScene';
import AddEditItemPanel from './components/AddEditItemPanel';
import styles from './configs/styles';
import './configs/translations';
import makeTestIDs from './helpers/misc';

export default class Wishlist extends Component {

  constructor() {
    super();
    this.imageCount = 0;
  }

  componentDidMount() {
    this.handleBackPress = this.handleBackPress.bind(this);
    BackAndroid.addEventListener(
      'hardwareBackPress',
      this.handleBackPress
  );
  }

  handleBackPress() {
    // Prevent exiting the app from any screen other than the main
    let routes = this.navigator.getCurrentRoutes();
    if (
      routes.length === 1) {
      return false;
    } else {
      this.navigator.pop();
      return true;
    }
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  renderScene(route, navigator) {
    switch(route.title) {
    case('Item list'): {
      return <ListScene
        ref={(listScene) => this.listScene = listScene}
        route={route} navigator={navigator}/>;
    }
    case('Edit item'):
      return <View>
        <Text style={{margin: 10}}>
        {I18n.t('editItem')} {this.listScene.state.itemToEdit.name}
        </Text>
        <AddEditItemPanel
        placeholder={this.listScene.state.itemToEdit.name}
        textInputStyle={styles.textInputStyleAddEditItem}
        onSubmitEditing={this.listScene.editItem.bind(this.listScene)}
        />
      </View>;
    case ('Show QRCode'):
      this.imageCount++;
      return <View style={{flex: 1}}>
          <Image
            style={{flex: 1, margin: 3}} source={{uri: 'file://' +
                           RNFetchBlob.fs.dirs.DocumentDir +
                           '/qr.png?' + this.imageCount}} resizeMode={'contain'}
            {...makeTestIDs('QRImage')}
                         />
         <Text style={{fontSize: 25, bottom: 35}}>
           {I18n.t('qrNote')}
         </Text>
        </View>;
    case ('Read QRCode'):
      return (
          <Camera
            style={{flex: 1}}
            barCodeTypes={['qr']}
            onBarCodeRead={this.listScene.processQR.bind(this.listScene)}
            {...makeTestIDs('Camera')}/>
      );
    }
  }

  render() {
    return <Navigator
      ref={(nav) => this.navigator = nav}
      initialRoute={{title: 'Item list', index: 0}}
      renderScene={this.renderScene.bind(this)}
      />;
  }
  }

AppRegistry.registerComponent('Wishlist', () => Wishlist);
