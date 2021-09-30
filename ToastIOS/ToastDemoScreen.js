import React, { useEffect, useState,useRef } from 'react';
import { StyleSheet, Text, View, Pressable, NativeModules } from 'react-native';
import Toast from './Toast';

const ToastDemoScreen = () => {

  useEffect(() => {
  }, []);

  const onShowToastPress = () => {
    //Toast.show("This is good.",Toast.POSITION_BOTTOM,2.0)
  }
  

  return (
    <View style={styles.container}>
        <Button
          text={'Show Toast'}
          onPress={onShowToastPress}
        />
    </View>
  );
};

const Button = ({ text, style, textStyle, testID, onPress, ...props }) => {
  return (
    <Pressable
      testID={testID}
      style={[styles.defaultBtn, style]}
      onPress={onPress}
      {...props}>
      <Text style={[styles.defaultBtnText, textStyle]}>{text}</Text>
    </Pressable>
  );
};

export default ToastDemoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"black"
  },
  defaultBtn: {
    borderRadius: 10,
    width: 100,
    height: 40,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});
