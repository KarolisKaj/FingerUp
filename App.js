import 'react-native-gesture-handler';
import * as React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './views/home'
import GameOfLife from './games/gameOfLife/gameOfLife.js'
import CardMatch from './games/cardMatch/cardMatch';
import PinchFish from './games/pinchFish/pinchFish';
import SeaMatch from './games/seaMatch/seaMatch';
import OutlineShape from './games/outlineShape/outlineShape';
import ConnectDots from './games/connectDots/connectDots';

const instructions = Platform.select({
  ios: `Press Cmd+R to reload,\nCmd+D or shake for dev menu`,
  android: `Double tap R on your keyboard to reload,\nShake or press menu button for dev menu`,
});

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Home"
          component={Home}
        />
        <Stack.Screen
          name="GameOfLife"
          component={GameOfLife}
        />
        <Stack.Screen
          name="CardMatch"
          component={CardMatch}
        />
        <Stack.Screen
          name="PinchFish"
          component={PinchFish}
        />
        <Stack.Screen
          name="SeaMatch"
          component={SeaMatch}
        />
        <Stack.Screen
          name="OutlineShape"
          component={OutlineShape}
        />
        <Stack.Screen
          name="ConnectDots"
          component={ConnectDots}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
