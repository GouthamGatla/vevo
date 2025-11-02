import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigation from './src/navigation/AppNavigation';

function App() {
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
