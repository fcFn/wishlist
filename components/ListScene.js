// The most important component which contains the list, the data model
// for the list to display, and some of the controls.

import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableNativeFeedback,
  ListView,
  ToastAndroid,
  Alert,
  Platform,
  Keyboard,
  AppState,
} from 'react-native';

import AddEditItemPanel from './AddEditItemPanel';
import ItemList from './ItemList';
import HelpModal from './HelpModal';
import MenuModal from './MenuModal';
import {packItems, unpackItems} from '../helpers/qr';
import RNFetchBlob from 'react-native-fetch-blob';
import qr from '../helpers/rn-qr-image';
import I18n from 'react-native-i18n';

import styles from '../configs/styles';

export default class ListScene extends Component {
  constructor() {
    super();
    this.EMPTY_ITEM_TEXT = I18n.t('emptyList');
    if (__DEV__) {
      this.defaultItems = require('./TestItems');
    } else {
      this.defaultItems = [
        {
          name: this.EMPTY_ITEM_TEXT,
          done: false,
        },
      ];
    }
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      items: [{}],
      inputActive: false,
      offsetForKeyboard: 0,
      itemToEdit: null,
      generatingQR: false,
      listChanged: false,
      menuModalVisible: false,
      helpModalVisible: false,
      helpModalType: 'notFirst',
    };
  };

  componentWillMount() {
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    AppState.addEventListener('change', this.handleAppStateChange);
    this.checkForFirstRun();
  }

  componentWillUnmount() {
    this.saveList('onExit');
    Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  _keyboardDidHide() {
    // Hiding keyboard should exit input mode
    // Might be inconvenient for external kb usecases
    this.setState({inputActive: false});
  }

  handleAppStateChange() {
    if ((AppState.currentState === 'background' ||
        AppState.currentState === 'inactive') &&
        this.userAddedItem) {
      this.saveList('onExit');
    }
  }

  removeItem(item) {
    let items = this.copyItems();
    let indexToRemoveAt = items.findIndex((element) => element.name === item);
    items.splice(indexToRemoveAt, 1);
    if (!items.length) {
      items = [{name: this.EMPTY_ITEM_TEXT, done: false}];
      this.userAddedItem = false;
    }
    this.setState({items: items});
    this.listChanged = true;
  }

  checkItem(item) {
    // It also unchecks checked item
    let items = this.copyItems();
    let indexofItemToCheck = items.findIndex(
        (element) => element.name === item
      );
    items[indexofItemToCheck] = {
      name: item,
      done: !items[indexofItemToCheck].done,
    };
    this.setState({items: items});
    this.listChanged = true;
  }

  copyItems() {
    return JSON.parse(JSON.stringify(this.state.items));
  }

  toggleInput() {
    this.setState({inputActive: !this.state.inputActive});
  }

  itemAlreadyExists(itemName, itemIndex) {
    if (Platform.OS === 'android') {
      ToastAndroid.show((I18n.t('itemAlreadyExists'))
                        .replace('${itemName}', itemName), 2);
    }
    // Scroll all the way up and then down to the related item
    this.itemList.listView.scrollTo({
      x: 0,
      y: -(this.ds.getRowCount() * 45),
      animate: false});
    this.itemList.listView.scrollTo({
      x: 0,
      y: itemIndex * 45,
      animate: false});
    let items = this.copyItems();
    items[itemIndex].alreadyExistsFlag = true;
    this.setState({items: items});
    setTimeout(() => {
      let items = this.copyItems();
      items[itemIndex].alreadyExistsFlag = false;
      this.setState({items: items});
    }, 3000);
  }

  addButtonLongPress() {
    this.setState({menuModalVisible: true});
  }

  _capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

  addNewItem(event) {
    let itemName = event.nativeEvent.text;
    if (itemName === '') {
      this.toggleInput();
      return;
    }
    // autoCapitalize prop doesn't work on some devices
    itemName = this._capitalize(itemName);
    let itemIndex = this.state.items.findIndex(
      (element) => element.name === itemName);
    if (itemIndex !== -1) {
      this.itemAlreadyExists(itemName, itemIndex);
    } else {
      let items;
      if (!this.userAddedItem) {
        items = [];
      } else {
        items = this.copyItems();
      }
      this.userAddedItem = true;
      items.push({name: itemName, done: false});
      this.setState({items: items});
      this.listChanged = true;
    }
    this.toggleInput();
  }

  editItem(event) {
    if (event.nativeEvent.text !== '') {
    // autoCapitalize prop doesn't work on some devices
      let capitalizedText = this._capitalize(event.nativeEvent.text);
      if (capitalizedText !== this.state.itemToEdit.name) {
        let items = this.copyItems();
        let itemToEditIndex = items.findIndex((element) =>
        element.name === this.state.itemToEdit.name);
        let existingItemIndex = items.
                  findIndex((element) => element.name === capitalizedText);
        if (existingItemIndex !== -1) {
          this.itemAlreadyExists(items[existingItemIndex].name,
          existingItemIndex);
        } else {
          items[itemToEditIndex].name = capitalizedText;
          this.setState({items: items});
          this.listChanged = true;
          this.userAddedItem = true;
        }
      }
    }
    this.props.navigator.pop();
  }

  recordItemToEdit(item) {
    // An item calls this when it is long pressed
    let itemToEdit = this.state.items.find(
      (element) => element.name === item);
    this.setState({itemToEdit: itemToEdit});
    this.props.navigator.push({
      title: 'Edit item',
      index: this.props.route.index + 1,
    });
  }

  checkForFirstRun() {
    RNFetchBlob.fs.exists(RNFetchBlob.fs.dirs.DocumentDir + '/config')
    .then((exists) => {
      if (!exists) {
        RNFetchBlob.fs.writeFile(RNFetchBlob.fs.dirs.DocumentDir + '/config',
          JSON.stringify({lastRunTime: Date.now()}), 'utf8')
        .then(() =>
          this.setState({helpModalVisible: true, helpModalType: 'first'})
        );
      } else {
        RNFetchBlob.fs
          .readFile(RNFetchBlob.fs.dirs.DocumentDir + '/config', 'utf8')
        .then((data) => {
          let config = JSON.parse(data);
          if (Date.now() - config.lastRunTime > 2592e6 ) {
            console.log(Date.now());
            this.setState({helpModalVisible: true, helpModalType: 'notFirst'});
          }
        })
        .then(() =>
        RNFetchBlob.fs.writeFile(RNFetchBlob.fs.dirs.DocumentDir + '/config',
          JSON.stringify({lastRunTime: Date.now()}), 'utf8'));
      }
    });
  }

  showHelpModal() {
    this.closeMenuModal();
    this.setState({helpModalVisible: true, helpModalType: 'onDemand'});
  }

  readQR() {
    this.props.navigator.push({
      title: 'Read QRCode',
      index: this.props.route.index + 1,
    });
  }

  processQR(data) {
    this.props.navigator.pop();
    if (data.type === 'QR_CODE') {
      try {
        this.setState({items: unpackItems(data.data)});
        this.listChanged = true;
      } catch (e) {
        if (Platform.OS === 'android') {
          ToastAndroid.show(I18n.t('invalidQR'), 2);
        }
      }
    }
  }

  generateQR() {
    this.closeMenuModal();
    this.setState({generatingQR: true});
    let image;
    try {
      image = qr.imageSync(packItems(this.state.items),
      {ec_level: 'L', margin: 0});
    } catch (e) {
      if (e = 'Too much data') {
        alert(I18n.t('qrListTooLarge'));
        return;
      } else {
        throw (e);
      }
    } finally {
      this.setState({generatingQR: false});
    }
    return RNFetchBlob
     .fs
     .writeFile(RNFetchBlob.fs.dirs.DocumentDir +
                '/qr.png', Array.from(image), 'ascii')
     .then(() => {
       this.setState({generatingQR: false});
       this.props.navigator.push({
         title: 'Show QRCode',
         index: this.props.route.index + 1,
       });
     });
  }


  saveList(type) {
    this.closeMenuModal();
    let filename = type === 'onExit' ? '/onExit.list' : '/1.list';
    let items = this.copyItems();
    // strip non-informative flags
    for (let item of items) {
      {
        delete item.alreadyExistsFlag;
      }
    }
    return RNFetchBlob.fs.writeFile(
      RNFetchBlob.fs.dirs.DocumentDir + filename,
      JSON.stringify(items),
      'utf8').then(() => {
        if (Platform.OS === 'android' && type !== 'onExit') {
          ToastAndroid.show(I18n.t('listSaved'), 2);
        }
        this.listChanged = false;
      });
  }

  loadList(type) {
    this.closeMenuModal();
    let filename = type === 'onStart' ? '/onExit.list' : '/1.list';
    return RNFetchBlob.fs.readFile(
      RNFetchBlob.fs.dirs.DocumentDir + filename,
      'utf8'
    )
    .then(
      (file) => {
        let items = JSON.parse(file);
        if (Platform.OS === 'android' && type !== 'onStart') {
          ToastAndroid.show(I18n.t('listLoaded'), 2);
        }
        this.userAddedItem = true;
        this.setState({items: items});
        this.listChanged = false;
      },
      () => {
        if (Platform.OS === 'android') {
          ToastAndroid.show(I18n.t('noListFound'), 2);
        }
      });
  }

  newList() {
    this.setState({items: [
      {
        name: this.EMPTY_ITEM_TEXT,
        done: false,
      },
    ]}
    );
    this.userAddedItem = false;
    this.listChanged = true;
  }

  newListAlert() {
    this.closeMenuModal();
    if(this.listChanged && this.userAddedItem) {
      Alert.alert(
      I18n.t('createNewListTitle'),
      I18n.t('createNewListMsg'),
        [
        {text: 'OK', onPress: this.newList.bind(this)},
        {text: 'Cancel'},
        ]
    );
    } else {
      this.newList();
    }
  }

  loadListAlert() {
    this.closeMenuModal();
    if (this.listChanged && this.userAddedItem) {
      Alert.alert(
      I18n.t('loadListTitle'),
      I18n.t('loadListMsg'),
        [
        {text: 'OK', onPress: this.loadList.bind(this)},
        {text: 'Cancel'},
        ]
    );
    } else {
      this.loadList();
    }
  }

  readQRAlert() {
    this.closeMenuModal();
    if (this.listChanged && this.userAddedItem) {
      Alert.alert(
        I18n.t('readQRAlertTitle'),
        I18n.t('readQRAlertMsg'),
        [
          {text: 'OK', onPress: this.readQR.bind(this)},
          {text: 'Cancel'},
        ]
      );
    } else {
      this.readQR();
    }
  }

  componentDidMount() {
    return RNFetchBlob.fs.exists(
      RNFetchBlob.fs.dirs.DocumentDir + '/onExit.list')
      .then((exists) => {
        if (exists) {
          this.loadList('onStart');
        } else {
          this.setState({items: this.defaultItems});
        }
      }
    );
  }

  closeHelpModal() {
    this.setState({helpModalVisible: false});
  }

  closeMenuModal() {
    this.setState({menuModalVisible: false});
  }

  render() {
    let newItemPanel = this.state.inputActive ?
                       <AddEditItemPanel style={styles.newItemInput}
                       textInputStyle={styles.textInputStyleAddEditItem}
                       onSubmitEditing={this.addNewItem.bind(this)} /> :
                       null;
    let addButton = this.state.inputActive ? null : <TouchableNativeFeedback
      onPress={this.toggleInput.bind(this)}
      onLongPress={this.addButtonLongPress.bind(this)}
      >
      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>
          ⊕
        </Text>
      </View>
    </TouchableNativeFeedback>;
    return (
      <View style={styles.container}>
        <HelpModal
          type={this.state.helpModalType}
          visible={this.state.helpModalVisible}
          closeHelpModal={this.closeHelpModal.bind(this)} />
        <MenuModal
          visible={this.state.menuModalVisible}
          closeMenuModal={this.closeMenuModal.bind(this)}
          generatingQR={this.state.generatingQR}
          generateQR={this.generateQR.bind(this)}
          readQRAlert={this.readQRAlert.bind(this)}
          newListAlert={this.newListAlert.bind(this)}
          loadListAlert={this.loadListAlert.bind(this)}
          saveList={this.saveList.bind(this)}
          showHelpModal={this.showHelpModal.bind(this)}
        />
        <ItemList
        ref={(itemList) => this.itemList = itemList}
        inputActive={this.state.inputActive}
        dataSource={this.ds.cloneWithRows(this.state.items)}
        checkItem = {this.checkItem.bind(this)}
        removeItem = {this.removeItem.bind(this)}
        recordItemToEdit={this.recordItemToEdit.bind(this)}
        initialSize={this.state.items.length}
        />
        {newItemPanel}
        <View style={styles.buttons}>
        {addButton}
      </View>
    </View>
    );
  };
}
