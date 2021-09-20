/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import VisualizerScreen from './sortingSrc/VisualizerScreen'
// import UnityView from './srcUnityGl/UnityView'
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => VisualizerScreen);
