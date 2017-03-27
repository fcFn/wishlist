import {Alert} from 'react-native';
import qr from '../../helpers/qr';
import React from 'react';
import i18n from 'react-native-i18n';
import '../../configs/translations';
import ListScene from '../../components/ListScene';
import _ from 'lodash';
import renderer from 'react-test-renderer';
import defaultItems from '../../components/TestItems';

jest.mock('react-native-fetch-blob');
jest.mock('../../helpers/qr');

let testItems = [
  {
    name: 'Apples',
    done: false,
  }, {
    name: 'Oranges',
    done: true,
  },
];

// setState mock for the component
ListScene.prototype.setState = function(state) {
  _.extend(this.state, state);
};

let ls;
let RNFetchBlob = require('react-native-fetch-blob');
let mockPush = jest.fn();
let mockPop = jest.fn();

// Various mocks
beforeEach(() => {
  ls = new ListScene;
  ls.spyCloseMenuModal = jest.spyOn(ls, 'closeMenuModal');
  ls.props = {
    navigator: {
      push: mockPush,
      pop: mockPop,
    },
    route: {
      index: 0,
    },
  };
  _.set(ls, 'itemList.listView.scrollTo', jest.fn());
  ls.spyItemAlreadyExists = jest.spyOn(ls, 'itemAlreadyExists');
  RNFetchBlob.fs.files = {};
});

describe('ListScene', () => {
  describe('component', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<ListScene/>);
      expect(tree).toMatchSnapshot();
    });

    it('loads default items', () => ls.componentDidMount().
      then(() => expect(ls.state.items).toEqual(defaultItems)));

    it('saves list', () => {
      ls.state.items = _.cloneDeep(testItems);
      return ls
        .saveList()
        .then(() => {
          let data = RNFetchBlob.fs.files['/1.list'];
          expect(JSON.parse(data)).toEqual(testItems);
        });
    });

    it('loads list', () => {
      RNFetchBlob.fs.files['/1.list'] = JSON.stringify(testItems);
      return ls
        .loadList()
        .then(() => expect(ls.state.items).toEqual(testItems));
    });

    it('loads list after rendering', () => {
      RNFetchBlob.fs.files['/onExit.list'] = JSON.stringify(testItems);
      return ls
        .componentDidMount()
        .then(() => expect(ls.state.items).toEqual(testItems));
    });

    it('shows the help modal', () => {
      ls.showHelpModal();
      expect(ls.spyCloseMenuModal).toBeCalled();
      expect(ls.state.helpModalVisible).toBe(true);
      expect(ls.state.helpModalType).toBe('onDemand');
    });

    it('switches to QR reading scene', () => {
      ls.readQR();
      expect(ls.props.navigator.push).toBeCalledWith(
        {title: 'Read QRCode',
          index: ls.props.route.index + 1}
      );
    });

    describe('addNewItem', () => {
      beforeEach(() => {
        ls.state.items = _.cloneDeep(testItems);
        ls.userAddedItem = true;
      });
      it('adds a new item', () => {
        let event = {
          nativeEvent: {
            text: 'bananas',
          },
        };
        ls.addNewItem(event);
        expect(ls.state.items).toEqual([
          {
            name: 'Apples',
            done: false,
          }, {
            name: 'Oranges',
            done: true,
          }, {
            name: 'Bananas',
            done: false,
          },
        ]);
        expect(ls.userAddedItem).toBe(true);
        expect(ls.listChanged).toBe(true);
      });

      it('doesn\'t add a new item if it\'s empty', () => {
        let event = {
          nativeEvent: {
            text: '',
          },
        };
        ls.addNewItem(event);
        let spy = jest.spyOn(ls, 'setState');
        expect(spy)
          .not
          .toBeCalled();
      });

      it('doesn\'t add a new item if it already exists', () => {
        let event = {
          nativeEvent: {
            text: 'oranges',
          },
        };
        ls.addNewItem(event);
        expect(ls.state.items).toEqual([
          {
            name: 'Apples',
            done: false,
          }, {
            name: 'Oranges',
            done: true,
            alreadyExistsFlag: true,
          },
        ]);
        expect(ls.spyItemAlreadyExists).toBeCalledWith('Oranges', 1);
      });

      it('places a new item over the placeholder item', () => {
        let event = {
          nativeEvent: {
            text: 'oranges',
          },
        };
        ls.state.items = [
          {
            name: 'placeholder',
            done: false,
          },
        ];
        ls.userAddedItem = false;
        ls.addNewItem(event);
        expect(ls.state.items).toEqual([
          {
            name: 'Oranges',
            done: false,
          },
        ]);
        expect(ls.userAddedItem).toBe(true);
      });
    });

    it('records an item to edit', () => {
      ls.state.items = _.cloneDeep(testItems);
      let item = testItems[1].name;
      ls.recordItemToEdit(item);
      expect(ls.state.itemToEdit).toEqual(testItems[1]);
      expect(mockPush).toBeCalledWith({title: 'Edit item', index: 1});
    });

    it('saves current list before exiting', () => {
      ls.state.items = _.cloneDeep(testItems);
      jest.mock('react-native');
      ls.saveList = jest.fn();
      ls.componentWillUnmount();
      expect(ls.saveList).toBeCalledWith('onExit');
      jest.unmock('react-native');
    });

    describe('editItem', () => {
      beforeEach(() => {
        ls.state.items = _.cloneDeep(testItems);
        ls.recordItemToEdit('Oranges');
      });

      it('edits the recorded item', () => {
        let event = {
          nativeEvent: {
            text: 'bananas',
          },
        };
        ls.editItem(event);
        expect(ls.state.items).toEqual([
          {
            name: 'Apples',
            done: false,
          }, {
            name: 'Bananas',
            done: true,
          },
        ]);
        expect(ls.listChanged).toBe(true);
        expect(ls.userAddedItem).toBe(true);
      });

      it('doesn\'t add an edited item if there is already' +
        ' an item with the same name',
      () => {
        let event = {
          nativeEvent: {
            text: 'apples',
          },
        };
        ls.editItem(event);
        expect(ls.state.items).toEqual([
          {
            'alreadyExistsFlag': true,
            'done': false,
            'name': 'Apples',
          }, {
            'done': true,
            'name': 'Oranges',
          },
        ]);
        expect(ls.spyItemAlreadyExists).toBeCalledWith('Apples', 0);
      });
    });

    it('generates the QR code and switched to QR scene', () => {
      let spySetState = jest.spyOn(ls, 'setState');
      qr.packItems.mockReturnValue(42);
      return ls.generateQR().then(() => {
        expect(ls.spyCloseMenuModal).toBeCalled();
        expect(spySetState.mock.calls[1][0]).toEqual({generatingQR: true});
        expect(spySetState.mock.calls[2][0]).toEqual({generatingQR: false});
        expect(RNFetchBlob.fs.files['/qr.png']).toBeDefined();
        expect(ls.props.navigator.push).toBeCalledWith({
          title: 'Show QRCode',
          index: ls.props.route.index + 1,
        });
      });
    });

    it('correctly sets the state after reading QR', () => {
      let testQRdata = [
        {name: 'Bananas', done: false},
        {name: 'Lemons', done: true}];
      qr.unpackItems.mockReturnValue(testQRdata);
      ls.processQR({type: 'QR_CODE'});
      expect(qr.unpackItems).toBeCalled();
      expect(ls.props.navigator.pop).toBeCalled();
      expect(ls.state.items).toEqual(testQRdata);
      expect(ls.listChanged).toBe(true);
    });

    it('scrolls to duplicate item instead of adding it', () => {
      ls.state.items = _.cloneDeep(testItems);
      ls.render();
      ls.componentDidMount();
      ls.itemAlreadyExists('Oranges', 1);
      expect(ls.state.items[1].name).toBe('Oranges');
      expect(ls.state.items[1].alreadyExistsFlag).toBe(true);
      expect(ls.itemList.listView.scrollTo.mock.calls[0][0]).toEqual({
        x: 0,
        y: -(ls.ds.getRowCount() * 45),
        animate: false,
      });
      expect(ls.itemList.listView.scrollTo.mock.calls[1][0]).toEqual({
        x: 0,
        y: 1 * 45,
        animate: false,
      });
    });

    describe('checkItem', () => {
      beforeEach(() => {
        ls.state.items = _.cloneDeep(testItems);
      });

      afterEach(() => {
        expect(ls.listChanged).toBe(true);
      });

      it('checks an unchecked item', () => {
        ls.checkItem('Apples');
        expect(ls.state.items[0].done).toBe(true);
      });

      it('unchecks a checked item', () => {
        ls.checkItem('Oranges');
        expect(ls.state.items[1].done).toBe(false);
      });
    });

    describe('newList', () => {
      it('clears the list', () => {
        ls.newList();
        expect(ls.state.items).toEqual([
          {name: ls.EMPTY_ITEM_TEXT, done: false}]);
        expect(ls.userAddedItem).toBe(false);
        expect(ls.listChanged).toBe(true);
      });
    });

    describe('Unsaved changes', () => {
      beforeEach(() => {
        Alert.alert = jest.fn();
        ls.listChanged = true;
        ls.userAddedItem = true;
      });

      it('warns before loading', () => {
        ls.loadListAlert();
        expect(ls.closeMenuModal).toBeCalled();
        let onPress = Alert.alert.mock.calls[0][2][0]['onPress'];
        expect(onPress.toString()).toBe(ls.loadList.bind(ls).toString());
        expect(Alert.alert).toBeCalledWith(i18n.t('loadListTitle'),
          i18n.t('loadListMsg'), [{text: 'OK', onPress: onPress},
          {text: 'Cancel'}]);
      });

      it('warns before creating a new list', () => {
        ls.newListAlert();
        expect(ls.closeMenuModal).toBeCalled();
        let onPress = Alert.alert.mock.calls[0][2][0]['onPress'];
        expect(onPress.toString()).toBe(ls.newList.bind(ls).toString());
        expect(Alert.alert).toBeCalledWith(i18n.t('createNewListTitle'),
          i18n.t('createNewListMsg'), [{text: 'OK', onPress: onPress},
          {text: 'Cancel'}]);
      });

      it('warns before switching to qr reading scene', () => {
        ls.readQRAlert();
        expect(ls.closeMenuModal).toBeCalled();
        let onPress = Alert.alert.mock.calls[0][2][0]['onPress'];
        expect(onPress.toString()).toBe(ls.readQR.bind(ls).toString());
        expect(Alert.alert).toBeCalledWith(i18n.t('readQRAlertTitle'),
          i18n.t('readQRAlertMsg'), [{text: 'OK', onPress: onPress},
          {text: 'Cancel'}]);
      });

      it('doesn\'t warn if there are no unsaved changes', () => {
        ls.listChanged = false;
        ls.userAddedItem = false;
        ls.loadList = jest.fn();
        ls.newList = jest.fn();
        ls.readQR = jest.fn();
        ls.closeMenuModal = jest.fn();
        ls.loadListAlert();
        ls.newListAlert();
        ls.readQRAlert();
        expect(ls.closeMenuModal.mock.calls.length).toBe(3);
        expect(Alert.alert).not.toBeCalled();
        expect(ls.loadList).toBeCalled();
        expect(ls.newList).toBeCalled();
        expect(ls.readQR).toBeCalled();
      });
    });

    describe('removeItem', () => {
      it('removes an item', () => {
        ls.state.items = _.cloneDeep(testItems);
        ls.removeItem('Oranges');
        expect(ls.state.items).toEqual([{
          name: 'Apples',
          done: false,
        }]);
        expect(ls.listChanged).toBe(true);
      });

      it('removes the last item and correctly inserts placeholder', () => {
        ls.state.items = [{name: 'Sausages', done: true}];
        ls.removeItem('Sausages');
        expect(ls.state.items).toEqual([{
          name: ls.EMPTY_ITEM_TEXT,
          done: false,
        }]);
        expect(ls.listChanged).toBe(true);
        expect(ls.userAddedItem).toBe(false);
      });
    });
  });
});
