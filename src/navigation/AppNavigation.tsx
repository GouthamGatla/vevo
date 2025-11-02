import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppRoutes } from "./AppRoutes";


const Stack = createStackNavigator();

const AppNavigation = () => {

    const Dashboard = () => {
        return (

            <Text> Dashboard Screen </Text>

        )
    }

    return (
        <SafeAreaView style={style.container}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={AppRoutes.dashboardScreen} screenOptions={{ headerShown: true }}>
                    <Stack.Screen name={AppRoutes.dashboardScreen} component={Dashboard}
                        // options={{ header : () => null }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaView>
    );
};

const style = StyleSheet.create({
    container: {
        flex: 1
    }
})

export default AppNavigation;