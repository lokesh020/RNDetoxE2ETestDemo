import React from 'react';
import {render} from '@testing-library/react-native'

import VisualizerScreen from './VisualizerScreen'

test("render visualizer component correctly",()=>{
    const {getByTestId} = render(<VisualizerScreen/>)
})