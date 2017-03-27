import React from 'react';
import 'react-native';
import HelpModal from '../../components/MenuModal';
import '../../configs/translations';
import renderer from 'react-test-renderer';

describe('Menu modal window', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<HelpModal />);
    expect(tree).toMatchSnapshot();
  });
});
