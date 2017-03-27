// This component is used for adding and editing items

import React, {Component} from 'react';
import {View, TextInput} from 'react-native';
import makeTestIDs from '../helpers/misc';

export default class AddEditItemPanel extends Component {
  componentWillUnmount() {
    this.textInput.blur();
    this.textInput.clear();
  }

  render() {
    return <View>
      <TextInput
      ref={(input) => this.textInput = input}
      defaultValue={this.props.placeholder}
      autoFocus={true}
      autoCapitalize={'sentences'}
      selectTextOnFocus={true}
      style={this.props.textInputStyle}
      onSubmitEditing={this.props.onSubmitEditing}
      {...makeTestIDs('AddEditItemTextInput')}
    />
    </View>;
  }
}
