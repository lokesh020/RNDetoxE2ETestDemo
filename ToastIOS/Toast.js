import { NativeModules, ToastAndroid, Platform } from 'react-native';
const ToastIOS = NativeModules.Toast

class Toast {

    static POSITION_TOP = "TOP"
    static POSITION_CENTER = "CENTER"
    static POSITION_BOTTOM = "BOTTOM"

    static THEME = {
        DARK : "DARK",
        LIGHT : "LIGHT"
    }

    static show = (message = "", position = Toast.POSITION_BOTTOM, duration = 2.0 , theme = Toast.THEME.LIGHT) => {
        if (Platform.OS == "android") {
            switch (position) {
                case Toast.POSITION_TOP:
                    ToastAndroid.showWithGravity(message,duration,ToastAndroid.TOP)
                    break;
                case Toast.POSITION_CENTER:
                    ToastAndroid.showWithGravity(message,duration,ToastAndroid.CENTER)
                    break;
                case Toast.POSITION_BOTTOM:
                    ToastAndroid.showWithGravity(message,duration,ToastAndroid.BOTTOM)
                    break;
                default:
                    break;
            }
        }else{
            ToastIOS.show(message,position,duration,theme)
        }
    }
}

export default Toast

