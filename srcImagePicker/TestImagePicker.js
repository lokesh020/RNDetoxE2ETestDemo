import React, { useState } from 'react'

import { View,Pressable,Text,StyleSheet,Image } from 'react-native'
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

/*
TestImagePicker component 
*/
const TestImagePicker = (params) =>  {

    const [imgUri, setImgUri] = useState("");

    const openGallery = () => {
        let  customOptions = {
            mediaType: "photo",
            maxWidth: 300,
            maxHeight: 300
        };
        launchImageLibrary(customOptions, (response) => {
            if (response.didCancel) {
                
            } else if (response.errorCode) {
                console.log('ImagePicker Error Happend: >>>', response.errorMessage);
                this.handleError(response.errorCode)
                reject(response.errorCode)
            } else {
                setImgUri(response.assets[0].uri)
            }
        })
    }
    

    const openCamera = () => {
       let  customOptions = {
            mediaType: "photo",
            maxWidth: 300,
            maxHeight: 300
        };
        launchCamera(customOptions, (response) => {
            if (response.didCancel) {

            } else if (response.errorCode) {
                console.log('ImagePicker Error: >>>', response.errorMessage);
                reject(response.errorCode)
            } else {
                setImgUri(response.assets[0].uri)
            }
        })
    }
    
    return (
        <View style = {{flex:1,alignItems:"center",justifyContent:"center"}}>

        <Image source = {{uri:imgUri}}  style = {{resizeMode:"contain",width:200,height:200}}/>

          <Pressable onPress = {openGallery}  style = {styles.btnLaunchGallery}>
            <Text style = {{fontSize:15, color:"white"}}>{"Open Gallery"}</Text>
          </Pressable>
          <Pressable onPress = {openCamera}  style = {styles.btnLaunchCamera}>
            <Text style = {{fontSize:15, color:"white"}}>{"Open Camera"}</Text>
          </Pressable>
        </View>
    )
}
export default TestImagePicker

const styles = StyleSheet.create({
    btnLaunchCamera : {
        alignItems:"center",
        justifyContent:"center",
        backgroundColor:"green",
        padding:15,
        marginTop:30
    },
    btnLaunchGallery : {
        alignItems:"center",
        justifyContent:"center",
        backgroundColor:"green",
        padding:15
    },
})