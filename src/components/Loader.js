import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  View,
  Dimensions,
  Modal,
} from 'react-native';

const { height, width } = Dimensions.get('window');

const Loader = ({ visibility, onBack }) => {
  return (
    <Modal
      animationType="none"
      visible={visibility}
      transparent={true}
      onRequestClose={() => {
        if (onBack) {
          onBack();
        }
      }}
    >
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          height: height,
          width: width,
        }}
      >
        <ActivityIndicator size="large" color={"#FFFF"}/>
        <StatusBar barStyle="default" />
      </View>
    </Modal>
  );
};

export default Loader;
