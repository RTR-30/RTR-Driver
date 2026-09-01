import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Platform
} from "react-native";

import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Provider, useDispatch } from "react-redux";
import store from "../redux/store";
import Ionicons from "react-native-vector-icons/Ionicons";

import InitialPage from "../index";
import OnboardingScreen from "../Component/PublicComponent/Onboarding/index";
import Login from "../Component/PublicComponent/Login/index";
import SignUp from "../Component/PublicComponent/Signup/index";
import ForgetPassword from "../Component/PublicComponent/Login/forgetPassword";

import OwnerHome from "../Component/PrivateComponent/CarOwner/OwnerHome/index";
import TripScreen from "../Component/PrivateComponent/CarOwner/TripScreen/index";
import BookingScreen from "../Component/PrivateComponent/CarOwner/BookingScreen/index";
import BookingList from "../Component/PrivateComponent/CarOwner/BookingList/index";
import ProfileScreen from "../Component/PrivateComponent/CommonScreen/Profile/index";
import HelpAndFeedback from "../Component/PrivateComponent/CarOwner/HelpAndFeedBack/index";
import ContactUs from "../Component/PrivateComponent/CarOwner/ContactUs/index";
import OrderHistory from "../Component/PrivateComponent/CarOwner/OrderHistory/index";
import MyReferal from "../Component/PrivateComponent/CarOwner/MyReferal";
import Statistics from "../Component/PrivateComponent/CarOwner/Statistics";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeOneSignalservice } from "./helper";
import { COLORS } from "../utils/ColorCode";
import { showError } from "../Common/ToastMessage";


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
    const navigation: any = useNavigation();
    const [token, setToken] = useState<any>(null);
    const [playerIds, setPlayerIds] = useState<any>(null);

    const removeOneSignalDeviceId = async () => {
        const data = {
            deviceId: playerIds,
            deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
        }
        
        try {
            const res = await removeOneSignalservice(token, data)
            
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.clear();
            navigation.navigate("Login");
        } catch (error) {
            showError(error);

        }
    }

    const handleLogout = async () => {
        try {
            await removeOneSignalDeviceId();
        } catch (error) {
            console.error("Error clearing user data:", error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const tokens = await AsyncStorage.getItem("token");
                const playerId = await AsyncStorage.getItem('ONESIGNAL_PLAYER_ID');
                if (tokens && playerId) {
                    setToken(tokens);
                    setPlayerIds(playerId);
                }
            } catch (error) {
                console.error("Error fetching user data from AsyncStorage:", error);
            }
        };

        fetchUserData();
    }, []);



    return (
        <>
            <DrawerContentScrollView {...props}>
                <View
                    style={{
                        padding: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: "#ddd",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 22,
                            fontWeight: "bold",
                            color: 'black'
                        }}
                    >
                        Menu
                    </Text>

                    <Text
                        style={{
                            color: "#666",
                            marginTop: 5,
                        }}
                    >
                        Welcome User
                    </Text>
                </View>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <View style={{ height: '20%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleLogout()} className="flex-row w-[25%] justify-around items-center">
                    <Ionicons name="power" size={25} color={"red"} />
                    <Text className="text-[20px] font-bold text-red-500">Logout</Text>
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
                },
                drawerItemStyle: {
                    borderRadius: 5,
                    marginVertical: 5,
                    paddingVertical: 10,
                },
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "black",
                    textAlign: "left",
                },
            }}
        >
            <Drawer.Screen name="Home" component={OwnerHome} options={{
                drawerItemStyle: { display: 'none' }
            }} />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={COLORS.primary} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Order History"
                component={OrderHistory}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" size={size} color={COLORS.primary} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Statistics"
                component={Statistics}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart-outline" size={size} color={COLORS.primary} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Invite Friends"
                component={MyReferal}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={COLORS.primary} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Term & Condition"
                component={HelpAndFeedback}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={COLORS.primary} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Contact Us"
                component={ContactUs}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="call-outline" size={size} color={COLORS.primary} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};


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
                    <Stack.Screen name={"ForgetPassword"} component={ForgetPassword} />
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