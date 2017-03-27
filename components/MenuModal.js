// The menu modal which appears after long pressing the add button.
// It contains buttons to perform various functions.

import React, {Component} from 'react';
import {Text,
        Modal,
        View,
        TouchableNativeFeedback,
        TouchableWithoutFeedback,
        ActivityIndicator} from 'react-native';
import I18n from 'react-native-i18n';
import styles from '../configs/styles';

export default class MenuModal extends Component {

  render() {
    let genQRButtonText = this.props.generatingQR ?
    <View><ActivityIndicator animating={true} size={'large'}/></View> :
      <Text style={styles.buttonText}>
        {I18n.t('genQR')}
      </Text>;

    return <Modal
    animationType={'none'}
    transparent={true}
    visible={this.props.visible}
    onRequestClose={this.props.closeMenuModal}
  >
    <TouchableWithoutFeedback onPress={this.props.closeMenuModal}>
    <View style={styles.menuModalRoot} >
        <View style={styles.menuModalContent}>
          <TouchableNativeFeedback onPress={this.props.generateQR}>
            <View style={[styles.button, {borderTopWidth: 2}]}>
                {genQRButtonText}
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={this.props.readQRAlert}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {I18n.t('readQR')}
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={this.props.saveList}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {I18n.t('saveList')}
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={this.props.loadListAlert}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {I18n.t('loadList')}
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={this.props.newListAlert}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {I18n.t('newList')}
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={this.props.showHelpModal}>
            <View style={[styles.button, {borderBottomWidth: 2}]}>
              <Text style={styles.buttonText}>
                {I18n.t('showHelpButton')}
              </Text>
            </View>
          </TouchableNativeFeedback>
        </View>
  </View>
  </TouchableWithoutFeedback>
  </Modal>;
  }
}
