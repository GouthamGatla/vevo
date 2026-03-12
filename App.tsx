import { Alert, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigation from './src/navigation/AppNavigation';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

function App() {

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
        <AppNavigation />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
