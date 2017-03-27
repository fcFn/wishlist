import React from 'react';
import 'react-native';
import AddEditItemPanel from '../../components/AddEditItemPanel';
import renderer from 'react-test-renderer';

describe('Item adding and editing input component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AddEditItemPanel />);
    expect(tree).toMatchSnapshot();
  });
});
