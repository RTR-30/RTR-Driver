import React from "react";
import {
    View,
    TouchableOpacity,
    Text
} from "react-native";

import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Provider, useDispatch } from "react-redux";
import store from "../redux/store";

import InitialPage from "../index";
import OnboardingScreen from "../Component/PublicComponent/Onboarding/index";
import Login from "../Component/PublicComponent/Login/index";
import SignUp from "../Component/PublicComponent/Signup/index";

import OwnerHome from "../Component/PrivateComponent/CarOwner/OwnerHome/index";
import TripScreen from "../Component/PrivateComponent/CarOwner/TripScreen/index";
import BookingScreen from "../Component/PrivateComponent/CarOwner/BookingScreen/index";
import BookingList from "../Component/PrivateComponent/CarOwner/BookingList/index";
import ProfileScreen from "../Component/PrivateComponent/CommonScreen/Profile/index";

import Ionicons from "react-native-vector-icons/Ionicons";
import { clearUser } from "../redux/reducer";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Constants for routes
// export const Routes = {
//     Initial: "Initial",
//     Onboard: "Onboard",
//     Login: "Login",
//     SignUp: "SignUp",
//     OwnerHome: "OwnerHome",
//     DriverHome: "DriverHome",
//     Trip: "Trip",
//     Booking: "Booking",
//     BookingList: "BookingList",
//     Profile: "Profile",
// };


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
    const navigation = useNavigation();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userData");
            navigation.navigate("Login");
        } catch (error) {
            console.error("Error clearing user data:", error);
        }
    };

    return (
        <>
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <View style={{ height: '20%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>Logout</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const DrawerNavigation = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerPosition: 'right',
                drawerActiveBackgroundColor: 'white',
                drawerStyle: {
                    width: '70%',
                }
            }}
        >
            <Drawer.Screen name="Home" component={OwnerHome} options={{
                drawerItemStyle: { display: 'none' }
            }} />
            <Drawer.Screen name={"Profile"} component={ProfileScreen} />
        </Drawer.Navigator>
    )
}

const NavigationPage = () => {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                    }}
                    initialRouteName="Initial"
                >
                    <Stack.Screen name={"Initial"} component={InitialPage} />
                    <Stack.Screen name={"Onboard"} component={OnboardingScreen} />
                    <Stack.Screen name={"Login"} component={Login} />
                    <Stack.Screen name={"SignUp"} component={SignUp} />
                    <Stack.Screen name={"OwnerHome"} component={DrawerNavigation} />
                    <Stack.Screen name={"Trip"} component={TripScreen} />
                    <Stack.Screen name={"Booking"} component={BookingScreen} />
                    <Stack.Screen name={"BookingList"} component={BookingList} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    )
}

export default NavigationPage;