import React from 'react';
import 'react-native';
import HelpModal from '../../components/HelpModal';
import '../../configs/translations';
import renderer from 'react-test-renderer';

describe('Help modal window', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<HelpModal type="first"/>);
    expect(tree).toMatchSnapshot();
  });
});
