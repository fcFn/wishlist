// Intermediate component wrapping ListView native component

import React, {Component} from 'react';
import {ListView, Keyboard, PanResponder} from 'react-native';

import Item from './Item';

export default class ItemList extends Component {

  componentWillMount() {
    // Prevents items activating when we are scrolling the list
    // by using gesture velocity
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (event, gestureState) => {
        if (gestureState.vy > 0.3 || gestureState.vy < -0.3) {
          return true;
        }
      }});
    this._keyboardShowHide = this._keyboardShowHide.bind(this);
    Keyboard.addListener('keyboardDidShow', this._keyboardShowHide);
  }

  _keyboardShowHide() {
    this.listView.scrollTo({
      x: 0,
      y: this.props.dataSource.getRowCount() * 50,
      animate: false});
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidShow', this._keyboardShowHide);
  }

  render() {
    return <ListView
      ref={(listView) => this.listView = listView}
      style={{flex: 1}}
      initialListSize={this.props.initialSize}
      // Fixes last item not displaying on some devices
      removeClippedSubviews={false}
      dataSource={this.props.dataSource}
      renderRow={
        (rowData) => <Item
          itemText = {rowData.name}
          done = {rowData.done}
          alreadyExistsFlag = {rowData.alreadyExistsFlag}
          checkItem = {this.props.checkItem}
          removeItem = {this.props.removeItem}
          recordItemToEdit={this.props.recordItemToEdit}
        />

    } {...this._panResponder.panHandlers}

  />;
  }
}
