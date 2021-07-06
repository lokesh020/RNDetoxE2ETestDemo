/* eslint-disable react-native/no-inline-styles */
import React,{useState,useEffect} from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { MenuItem } from '../components/MenuItem';
import { Button } from '../components/Button';
import { BannerImage } from '../components/BannerImage';
import menuData from '../data/menu.js';

export const MenuScreen = ({ navigation }) => {

  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const getMenuItems = () => {
      fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(json => {
        setMenuItems(menuData)
      })
    }
    getMenuItems()
  }, []);

  const handlePress = item => () =>
    navigation.navigate('OptionScreen', { item });

  return (
    <SafeAreaView testID="menu-screen">
      <ScrollView>
        <BannerImage url="https://pbs.twimg.com/profile_banners/1093412383/1619207896/1500x500" />
        <Button
          text="Build Your Own"
          buttonStyles={{ padding: 16 }}
          onPress={() => navigation.navigate('Build')}
        />
        {menuItems.map(item => (
          <MenuItem
            key={item.id}
            testID={item.id}
            item={item}
            handlePress={handlePress(item)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
