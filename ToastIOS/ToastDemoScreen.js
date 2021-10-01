import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, NativeModules } from 'react-native';
import FSManager from '../FSModule/FSManager';
import Toast from './Toast';

const ToastDemoScreen = () => {
  useEffect(() => {}, []);

  const onShowToastPress = () => {
    const path = FSManager.DocumentDirectoryPath;
    Toast.show('path is :- ' + path, Toast.POSITION_BOTTOM, 2.0);
  };

  const onGetFolderDetail = () => {
    // FSManager.readDir(FSManager.DownloadDirectoryPath).then((contents)=>{
    //   const arrFileNames = contents.map((e)=>e.name)
    //   const strNames = arrFileNames.join(",")
    //   Toast.show('File write>>>>' + strNames, Toast.POSITION_BOTTOM, 100.0);
    // });
    FSManager.writeFile(FSManager.DownloadDirectoryPath + "/test12.txt","Made native module with sujeet sonam").then(()=>{
      Toast.show('File wrote>>>>', Toast.POSITION_BOTTOM, 100.0);
    })
  };

  return (
    <View style={styles.container}>
      <Button text={'Show Toast'} onPress={onShowToastPress} />

      <Button text={'Get Folder Detail'} onPress={onGetFolderDetail} style={{marginTop:25, width:150}}/>

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
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
