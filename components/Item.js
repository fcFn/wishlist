// This component is used for the items which constitute the list

import React, {Component} from 'react';
import {Text, PanResponder, Animated} from 'react-native';

import styles from '../configs/styles';

export default class Item extends Component {
  constructor() {
    super();
    this._animationValues = {
      _color: new Animated.Value(0),
      panX: new Animated.Value(0),
    };
    this._animationValues.color = this._animationValues._color.interpolate(
      {
        inputRange: [0, 1, 2, 3, 4],
        outputRange: [
          styles.itemColors.inactive,
          styles.itemColors.checked,
          styles.itemColors.remove,
          styles.itemColors.active,
          styles.itemColors.alreadyExists,
        ],
      }
    );
    this._PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: this._onPanResponderGrant.bind(this),
      onPanResponderTerminate: this._onPanResponderTerminate.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this),
      onPanResponderMove: Animated.event([null,
                          {dx: this._animationValues.panX}]),
    });
  }

  _checkForLongPress() {
    this._animationValues.panX.stopAnimation((x) => {
      if (x > -5) {
        // Prevent checking item on switching to edit item scene
        this.editing = true;
        this.props.recordItemToEdit(this.props.itemText);
      }
    });
  }

  _onPanResponderGrant() {
    this._animationValues._color.setValue(3);
    this._animationValues.panX.addListener(({value: x}) => {
      if (x > 0) {
        this._animationValues.panX.setValue(0);
      }
      if (x < -100) {
        this._animationValues._color.setValue(2);
        this._toRemove = true;
      } else {
        this._animationValues._color.setValue(3);
        this._toRemove = false;
      }
    });
    this.longPressTimeout = setTimeout(
      this._checkForLongPress.bind(this), 1000);
  }

  _clearOnRelease() {
    this._animationValues.panX.removeAllListeners();
    this._animationValues.panX.setValue(0);
    if (this.props.done) {
      this._animationValues._color.setValue(1);
    } else {
      this._animationValues._color.setValue(0);
    }
    this.editing = false;
    clearTimeout(this.longPressTimeout);
  }

  _onPanResponderRelease(_, gestureState) {
    this._animationValues.panX.stopAnimation((x) => {
      // If user changed his mind about deleting an item,
      // it shouldn't be checked or unchecked
      if (x === 0 && gestureState.dx < 5 && !this.editing) {
        this.props.checkItem(this.props.itemText);
      }
    });
    this._clearOnRelease();
    if (this._toRemove) {
      this.props.removeItem(this.props.itemText);
      this._toRemove = false;
    }
  }

  _onPanResponderTerminate() {
    this._clearOnRelease();
  }

  componentWillUpdate() {
    this._animationValues._color.setValue(0);
  }

  componentDidMount() {
    // Update colors when loading the list
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    if (this.props.done) {
      this._animationValues._color.setValue(1);
    }
    if (this.props.alreadyExistsFlag) {
      this._animationValues._color.setValue(4);
    }
  }

  render() {
    let itemText = this.props.done ?
        '✓ ' + this.props.itemText : this.props.itemText;
    let style = [
      styles.item,
      {
        backgroundColor: this._animationValues.color,
        transform: [{translateX: this._animationValues.panX}],
      },
    ];
    return <Animated.View style={style} {...this._PanResponder.panHandlers}>
        <Text style={styles.itemText}>
          {itemText}
        </Text>
      </Animated.View>;
  }
}
