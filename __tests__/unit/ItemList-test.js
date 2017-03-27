import React from 'react';
import 'react-native';
import {ListView} from 'react-native';
import ListScene from '../../components/ListScene';
import ItemList from '../../components/ItemList';
import renderer from 'react-test-renderer';
import _ from 'lodash';

let il;
let dataSource;
let ds;
let ls;
describe('List of items', () => {
  beforeAll(() => {
    ls = new ListScene();
    ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    dataSource = ds.cloneWithRows(ls.state.items);
  });

  beforeEach(() => {
    il = new ItemList();
  });

  it('renders correctly', () => {
    const tree = renderer.create(<ItemList dataSource={dataSource}/>);
    expect(tree).toMatchSnapshot();
  });

  it('scrolls the list to the bottom when keyboard shows up', () => {
    il.props = {
      inputActive: true,
      dataSource: dataSource,
    };
    _.set(il, 'listView.scrollTo', jest.fn());
    il._keyboardShowHide();
    expect(il.listView.scrollTo)
      .toBeCalledWith({x: 0, y: dataSource.getRowCount() * 50, animate: false});
  });
});
