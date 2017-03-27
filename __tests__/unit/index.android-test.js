import {BackAndroid} from 'react-native';
import React from 'react';
import Index from '../../index.android.js';
import renderer from 'react-test-renderer';
import _ from 'lodash';
import ListScene from '../../components/ListScene';
jest.mock('react-native-fetch-blob');
jest.mock('react-native-camera');

let index;
describe('Root component', () => {
  beforeEach(() => {
    index = new Index();
    index.listScene = new ListScene;
    _.set(index, 'listScene.state.itemToEdit.name', 'TestItem');
  });

  it('removes event listener upon unmounting', () => {
    index.componentWillUnmount();
    expect(BackAndroid.removeEventListener)
      .toBeCalledWith('hardwareBackPress', index.handleBackPress);
  });

  it('handles Android back press correctly', () => {
    index.navigator = {getCurrentRoutes: jest.fn()
      .mockReturnValueOnce([0])
      .mockReturnValueOnce([0, 1]),
      pop: jest.fn()};
    expect(index.handleBackPress()).toBe(false);
    expect(index.handleBackPress()).toBe(true);
    expect(index.navigator.pop.mock.calls.length).toBe(1);
  });

  it('renders correctly', () => {
    const tree = renderer.create(<Index/>);
    expect(tree).toMatchSnapshot();
  });

  it('renders with Edit item scene', () => {
    const tree = renderer.create(index.renderScene(
      {title: 'Edit item', index: 1}, index.navigator));
    expect(tree).toMatchSnapshot();
  });

  it('renders with ShowQR Code scene', () => {
    const tree = renderer.create(index.renderScene(
      {title: 'Show QRCode', index: 1}, index.navigator));
    expect(tree).toMatchSnapshot();
  });

  it('renders with Read QRCode scene', () => {
    const tree = renderer.create(index.renderScene(
      {title: 'Read QRCode', index: 1}, index.navigator));
    expect(tree).toMatchSnapshot();
  });
});
