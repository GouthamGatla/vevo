import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppRoutes } from "./AppRoutes";
import { PostsListScreen } from "../features/posts/PostsListScreen";
import { PostDetailScreen } from "../features/posts/PostDetailScreen";
import { UserDetailScreen } from "../features/users/UserDetailScreen";
import { CustomHeader } from "../components/CustomHeader/CustomHeader";

const Stack = createStackNavigator();

const AppNavigation = () => {
    const createScreenOptions = ({ route }: { route: any }) => {
        const getScreenTitle = () => {
            switch (route.name) {
                case 'PostsListScreen':
                    return 'Forum Posts';
                case 'PostDetailScreen':
                    return 'Post Details';
                case 'UserDetailScreen':
                    return 'Profile';
                default:
                    return 'Forum';
            }
        };

        const showBackButton = route.name !== 'PostsListScreen';
        const hideHeader = route.name === 'PostsListScreen';

        return {
            header: hideHeader ? () => null : () => (
                <CustomHeader
                    title={getScreenTitle()}
                    showBackButton={showBackButton}
                />
            ),
            headerShown: !hideHeader,
        };
    };

    return (
        <SafeAreaView style={styles.container}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName={AppRoutes.posts}
                    screenOptions={({ route }) => createScreenOptions({ route })}
                >
                    <Stack.Screen
                        name={AppRoutes.posts}
                        component={PostsListScreen}
                    />
                    <Stack.Screen
                        name={AppRoutes.postDetail}
                        component={PostDetailScreen}
                    />
                    <Stack.Screen
                        name={AppRoutes.userDetail}
                        component={UserDetailScreen}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default AppNavigation;
