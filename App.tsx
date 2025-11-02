/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider
} from 'react-native-safe-area-context';
import AppNavigation from './src/navigation/AppNavigation';


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigation />
    </SafeAreaProvider>
  );
}


export default App;
