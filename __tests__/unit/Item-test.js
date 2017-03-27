import React from 'react';
import 'react-native';
import Item from '../../components/Item';
import renderer from 'react-test-renderer';
import _ from 'lodash';

let item;

describe('Item component', () => {
  beforeEach(() => {
    item = new Item;
    item.props = {
      itemText: 'Oranges',
      done: true,
      recordItemToEdit: jest.fn(),
      checkItem: jest.fn(),
      removeItem: jest.fn(),
    };
    _.set(item, '_animationValues._color.setValue', jest.fn());
    _.set(item, '_animationValues.panX.removeAllListeners', jest.fn());
    _.set(item, '_animationValues.panX.setValue', jest.fn());
    _.set(item, '_animationValues._color.stopAnimation', jest.fn()
          .mockImplementation((cb) => {
            cb(7);
          }));
  });

  it('renders correctly', () => {
    const tree = renderer.create(<Item/>);
    expect(tree).toMatchSnapshot();
  });

  describe('onPanresponderGrant', () => {
    it('correctly sets the background color on touching', () => {
      _.set(item, '_animationValues.panX.addListener', jest.fn()
          .mockImplementation((cb) => {
            cb({value: -30});
          }));
      item._onPanResponderGrant();
      expect(item._animationValues._color.setValue).toBeCalledWith(3);
      expect(item._animationValues.panX.addListener).toBeCalled();
      expect(item._toRemove).toBe(false);
    });

    it('will not allow moving the item to the right', () => {
      _.set(item, '_animationValues.panX.addListener', jest.fn()
          .mockImplementation((cb) => {
            cb({value: 10});
          }));
      item._onPanResponderGrant();
      expect(item._animationValues.panX.setValue).toBeCalledWith(0);
    });

    it('will mark item for removal if it\'s moved past the threshhold', () => {
      _.set(item, '_animationValues.panX.addListener', jest.fn()
          .mockImplementation((cb) => {
            cb({value: -1000});
          }));
      item._onPanResponderGrant();
      expect(item._animationValues._color.setValue).toBeCalledWith(2);
      expect(item._toRemove).toBe(true);
    });

    it('always sets the timer for the long press', () => {
      item._onPanResponderGrant();
      expect(item.longPressTimeout).toEqual(expect.anything());
    });
  });

  describe('_clearOnRelease', () => {
    it('clears everything if the item is no longer touched', () => {
      item._clearOnRelease();
      expect(item._animationValues.panX.removeAllListeners).toBeCalled();
      expect(item._animationValues.panX.setValue).toBeCalledWith(0);
      expect(item.editing).toBe(false);
      expect(item.longPressTimeout).toBeUndefined();
    });

    it('correctly sets the background color of the item', () => {
      item._clearOnRelease();
      expect(item._animationValues._color.setValue).toBeCalledWith(1);
      item.props.done = false;
      item._clearOnRelease();
      expect(item._animationValues._color.setValue).toBeCalledWith(0);
    });
  });

  describe('_onPanResponderRelease', () => {
    it('will not check/uncheck item if the user swiped the item around', () => {
      item._animationValues.panX.stopAnimation = jest
      .fn().mockImplementation((cb) => {
        cb(0);
      });
      item.editing = false;
      item._onPanResponderRelease(null, {dx: 4});
      expect(item.props.checkItem).toBeCalledWith(item.props.itemText);
    });

    it('will send an item to removal if it\'s swiped past threshhold', () => {
      item._toRemove = true;
      let spyClearOnRlease = jest.spyOn(item, '_clearOnRelease');
      item._onPanResponderRelease(null, {dx: 0});
      expect(spyClearOnRlease).toBeCalled();
      expect(item.props.removeItem).toBeCalledWith(item.props.itemText);
      expect(item._toRemove).toBe(false);
    });
  });

  it('sets light green background if the item is checked', () => {
    item.componentDidUpdate();
    expect(item._animationValues._color.setValue).toBeCalledWith(1);
    expect(item._animationValues._color.setValue.mock.calls[1]).toBeUndefined();
  });

  it('sets dark green background if tried to add existing item', () => {
    item.props = {
      done: true,
      alreadyExistsFlag: true,
    };
    item.componentDidUpdate();
    expect(item._animationValues._color.setValue.mock.calls[1][0]).toBe(4);
  });

  it('sends the correct item for editing', () => {
    item._checkForLongPress();
    expect(item.editing).toBe(true);
    expect(item.props.recordItemToEdit).toBeCalledWith('Oranges');
  });
});
