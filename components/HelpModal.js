// This component is used to display the modal containing help information

import React, {Component} from 'react';
import {Text, Modal, View, TouchableNativeFeedback} from 'react-native';
import I18n from 'react-native-i18n';
import styles from '../configs/styles';

export default class HelpModal extends Component {

  render() {
    let title;
    switch (this.props.type) {
    case 'first':
      title = 'helpModalTitleFirstRun';
      break;
    case 'notFirst':
      title = 'helpModalTitleNotFirstRun';
      break;
    case 'onDemand':
      title = 'helpModalTitleOnDemand';
    }
    return <Modal
    animationType={'none'}
    transparent={true}
    visible={this.props.visible}
    onRequestClose={this.props.closeHelpModal}
  >
    <View style={styles.helpModalRoot}>
      <View style={styles.helpModalContent}>
        <Text style={styles.helpModalContentText}>
          {I18n.t(title) + '\n\n'}
          {I18n.t('helpModalControlsAdd') + '\n\n'}
          {I18n.t('helpModalControlsRemove') + '\n\n'}
          {I18n.t('helpModalControlsEdit') + '\n\n'}
          {I18n.t('helpModalControlsMenu') + '\n\n'}
          {I18n.t('helpModalControlsMenuTitle') + '\n\n'}
          {I18n.t('helpModalControlsMenuGenQR') + '\n\n'}
          {I18n.t('helpModalControlsMenuReadQR') + '\n\n'}
          {I18n.t('helpModalControlsMenuLoad') + '\n\n'}
          {I18n.t('helpModalControlsMenuSave') + '\n\n'}
          {I18n.t('helpModalControlsMenuNew') + '\n\n'}
          {I18n.t('helpModalControlsHelp')}
        </Text>
        <TouchableNativeFeedback onPress={this.props.closeHelpModal}>
          <View style={styles.helpModalCloseButton}>
            <Text style={styles.helpModalCloseButtonText}>
                {I18n.t('helpModalCloseButton')}
            </Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  </Modal>;
  }
}
