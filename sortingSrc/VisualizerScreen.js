import React, { useEffect, useState,useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import {getMergeSortAnimations} from './sortingAlgo'

// Change this value for the speed of the animations.
const ANIMATION_SPEED_MS = 1;

// Change this value for the number of bars (value) in the array.
const NUMBER_OF_ARRAY_BARS = 75;

// This is the main color of the array bars.
const PRIMARY_COLOR = '#A5D6A7';

// This is the color of array bars that are being compared throughout the animations.
const SECONDARY_COLOR = 'red';

let barRefs = []

const VisualizerScreen = () => {
  const [arrBars, setArrBars] = useState([]);

  useEffect(() => {
    resetArrBars();
  }, []);

  const resetArrBars = () => {
    const array = [];
    for (let i = 0; i < NUMBER_OF_ARRAY_BARS; i++) {
      array.push(randomIntFromInterVal(5, 400));
    }
    setArrBars(array);
  };

  const onResetStateBtnPress = () => {
    resetArrBars();
  };

  const onMergeSortBtnPress = () => {
    const animations = getMergeSortAnimations(arrBars);
    for (let i = 0; i < animations.length; i++) {
      const isColorChange = i % 3 !== 2;
      if (isColorChange) {
        const [barOneIdx, barTwoIdx] = animations[i];
       
        const color = i % 3 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
        setTimeout(() => {
            barRefs[barOneIdx].setNativeProps({backgroundColor: color})
            barRefs[barTwoIdx].setNativeProps({backgroundColor: color})
        }, i * ANIMATION_SPEED_MS);
      } else {
        setTimeout(() => {
          const [barOneIdx, newHeight] = animations[i];
          barRefs[barOneIdx].setNativeProps({height: newHeight})
        }, i * ANIMATION_SPEED_MS);
      }
    }
  };

  return (
    <View style={styles.container} testID="v-screen">
      <View style={styles.upperPart}>
        {arrBars.map((value, i) => (
          <View ref = {(ref)=> barRefs[i] = ref}  key={i} style={[styles.bar, { height: value }]}></View>
        ))}
      </View>
      <View style={styles.bottomPart}>
        <Button
          text={'Reset Stats'}
          testID="reset-stats"
          onPress={onResetStateBtnPress}
        />
        <Button
          text={'Merge Sort'}
          testID="merge-sort"
          onPress={onMergeSortBtnPress}
        />
      </View>
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

const randomIntFromInterVal = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export default VisualizerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bar: {
    width: 2,
    marginLeft: 3,
    backgroundColor: '#A5D6A7',
  },
  upperPart: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'baseline',
    top: 100,
    flexDirection: 'row',
  },
  bottomPart: {
    flex: 0.2,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
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
