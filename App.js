import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './views/home'
import GameOfLife from './games/gameOfLife/gameOfLife.js'
import CardMatch from './games/cardMatch/cardMatch';
import PinchFish from './games/pinchFish/pinchFish';
import SeaMatch from './games/seaMatch/seaMatch';
import OutlineShapeGame from './games/outlineShape/outlineShapeGame';
import ConnectDots from './games/connectDots/connectDots';
import Exercise from './games/exercise/exercise';
import GameStart from './views/gameStart';
import FingerUp from './views/fingerup';
import Movement from './views/movement';

const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home}  />
        <Stack.Screen name="GameStart" component={GameStart} />
        <Stack.Screen name="GameOfLife" component={GameOfLife} />
        <Stack.Screen name="CardMatch" component={CardMatch} />
        <Stack.Screen name="PinchFish" component={PinchFish} />
        <Stack.Screen name="SeaMatch" component={SeaMatch} />
        <Stack.Screen name="OutlineShapeGame" component={OutlineShapeGame} />
        <Stack.Screen name="ConnectDots" component={ConnectDots} />
        <Stack.Screen name="FingerUp" component={FingerUp} />
        <Stack.Screen name="Movement" component={Movement} />
        <Stack.Screen name="Exercise" component={Exercise} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
