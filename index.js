/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import ToastDemoScreen from './ToastIOS/ToastDemoScreen'
// import UnityView from './srcUnityGl/UnityView'
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => ToastDemoScreen);
