import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Platform,
    Image,
    Modal,
    ActivityIndicator,
} from "react-native";
import DeviceInfo from "react-native-device-info";

import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
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

import Googlemaps from "../Common/GoogleMaps";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeOneSignalservice } from "./helper";
import { COLORS } from "../utils/ColorCode";
import { showError, showSuccess } from "../Common/ToastMessage";
import { getUserDetailsService } from "../Component/PrivateComponent/CarOwner/MyReferal/helper";


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
    const navigation: any = useNavigation();
    const [token, setToken] = useState<any>(null);
    const [playerIds, setPlayerIds] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [appVersion, setAppVersion] = useState<string>("1.0.0");
    const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);
    const [loggingOut, setLoggingOut] = useState<boolean>(false);

    const activeRouteName = props.state?.routes[props.state?.index]?.name;

    const fetchUserData = async () => {
        try {
            const res = await getUserDetailsService();
            const { data: { success = false, user = {} } } = res;

            if (success === true) {
                setUserData(user);
            } else {
                showError("Error Referal Code")
            }
        } catch (error) {
            showError(error)
        }
    }

    useEffect(() => {
        try {
            const ver = DeviceInfo.getVersion();
            if (ver) setAppVersion(ver);
        } catch (e) {
            // ignore
        }
        fetchUserData();
    }, []);

    // Refresh user data when drawer opens or updates
    useEffect(() => {
        const unsubscribe = props.navigation.addListener("state", () => {
            fetchUserData();
        });
        return unsubscribe;
    }, [props.navigation]);

    const performLogout = async () => {
        setLoggingOut(true);
        try {
            if (token && playerIds) {
                const data = {
                    deviceId: playerIds,
                    deviceType: Platform.OS === "ios" ? "ios" : "android",
                };
                try {
                    await removeOneSignalservice(token, data);
                } catch (e) {
                    console.warn("OneSignal removal warning:", e);
                }
            }
            await AsyncStorage.removeItem("UserData");
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("token");
            await AsyncStorage.clear();
            setLogoutModalVisible(false);
            navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
            });
            showSuccess("Logged out successfully");
        } catch (error) {
            console.error("Error during logout:", error);
            await AsyncStorage.clear();
            navigation.navigate("Login");
        } finally {
            setLoggingOut(false);
        }
    };

    const displayName = userData?.Name || userData?.name || "Car Owner";
    const displayPhone = userData?.MobileNo || userData?.phno || userData?.phone || userData?.Email || userData?.email || "";
    const profilePic = userData?.ProfilePic || userData?.img || null;

    const getInitials = (name?: string) => {
        if (!name) return "CO";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const menuItems = [
        {
            name: "Profile",
            label: "My Profile",
            subtitle: "Personal information & car details",
            icon: "person-outline",
            activeIcon: "person",
        },
        {
            name: "Order History",
            label: "Trip History",
            subtitle: "Completed & past rides",
            icon: "time-outline",
            activeIcon: "time",
        },
        {
            name: "Statistics",
            label: "Statistics & Insights",
            subtitle: "Trips summary & activity volume",
            icon: "stats-chart-outline",
            activeIcon: "stats-chart",
        },
        {
            name: "Invite Friends",
            label: "Refer & Earn",
            subtitle: "Share code & receive rewards",
            icon: "gift-outline",
            activeIcon: "gift",
            badge: "Rewards",
        },
        {
            name: "Term & Condition",
            label: "Terms & Conditions",
            subtitle: "Policies & user guidelines",
            icon: "document-text-outline",
            activeIcon: "document-text",
        },
        {
            name: "Contact Us",
            label: "Contact & Support",
            subtitle: "Reach our 24/7 support team",
            icon: "headset-outline",
            activeIcon: "headset",
        },
    ];

    return (
        <View className="flex-1 bg-white">
            {/* Drawer Header with Brand Profile Card */}
            <View className="bg-[#E0211F] pt-12 pb-5 px-5">
                {/* Top Row: App Brand & Close Button */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <View className="w-7 h-7 rounded-lg bg-white/20 items-center justify-center mr-2">
                            <Ionicons name="car" size={16} color="#ffffff" />
                        </View>
                        <Text className="text-white text-[17px] font-black tracking-tight">
                            RTR Driver
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => props.navigation.closeDrawer()}
                        className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="close" size={18} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* User Profile Section (Display Only) */}
                <View className="flex-row items-center bg-white/10 rounded-2xl p-3 border border-white/15">
                    {profilePic ? (
                        <Image
                            source={{ uri: profilePic }}
                            className="w-13 h-13 rounded-full border-2 border-white/80 mr-3"
                        />
                    ) : (
                        <View className="w-12 h-12 rounded-full bg-white/25 border-2 border-white/40 items-center justify-center mr-3">
                            <Text className="text-white text-[16px] font-black">
                                {getInitials(displayName)}
                            </Text>
                        </View>
                    )}

                    <View className="flex-1">
                        <Text
                            className="text-white text-[16px] font-black"
                            numberOfLines={1}
                        >
                            {displayName}
                        </Text>
                        {displayPhone ? (
                            <Text
                                className="text-white/80 text-[12px] font-medium mt-0.5"
                                numberOfLines={1}
                            >
                                {displayPhone}
                            </Text>
                        ) : null}

                        <View className="self-start flex-row items-center bg-white/20 px-2 py-0.5 rounded-full mt-1.5">
                            <Ionicons name="checkmark-circle" size={11} color="#ffffff" />
                            <Text className="text-[10px] font-bold text-white ml-1">
                                Verified Owner
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Menu Items List */}
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-3">
                    <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2">
                        Menus
                    </Text>

                    {menuItems.map((item, index) => {
                        const isActive = activeRouteName === item.name;

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => props.navigation.navigate(item.name)}
                                className={`flex-row items-center p-3 rounded-2xl mb-1.5 border ${isActive
                                    ? "bg-red-50/80 border-red-200"
                                    : "bg-white border-transparent active:bg-slate-50"
                                    }`}
                                activeOpacity={0.7}
                            >
                                {/* Icon container */}
                                <View
                                    className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isActive ? "bg-[#E0211F]" : "bg-slate-100"
                                        }`}
                                >
                                    <Ionicons
                                        name={(isActive ? item.activeIcon : item.icon) as any}
                                        size={18}
                                        color={isActive ? "#ffffff" : "#475569"}
                                    />
                                </View>

                                {/* Label & subtitle */}
                                <View className="flex-1 mr-2">
                                    <View className="flex-row items-center">
                                        <Text
                                            className={`text-[14px] font-bold ${isActive ? "text-[#E0211F]" : "text-slate-800"
                                                }`}
                                        >
                                            {item.label}
                                        </Text>
                                        {item.badge && (
                                            <View className="bg-emerald-100 px-2 py-0.5 rounded-full ml-2">
                                                <Text className="text-[10px] font-extrabold text-emerald-800">
                                                    {item.badge}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text
                                        className="text-[11px] text-slate-400 font-medium mt-0.5"
                                        numberOfLines={1}
                                    >
                                        {item.subtitle}
                                    </Text>
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={15}
                                    color={isActive ? "#E0211F" : "#cbd5e1"}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </DrawerContentScrollView>

            {/* Bottom Section: Logout & Footer */}
            <View className="border-t border-slate-100 p-4 bg-slate-50/50">
                <TouchableOpacity
                    onPress={() => setLogoutModalVisible(true)}
                    className="flex-row items-center justify-between bg-red-50 border border-red-100 rounded-2xl p-3.5"
                    activeOpacity={0.8}
                >
                    <View className="flex-row items-center">
                        <View className="w-9 h-9 rounded-xl bg-red-100/80 items-center justify-center mr-3">
                            <Ionicons name="log-out-outline" size={19} color="#E0211F" />
                        </View>
                        <View>
                            <Text className="text-[14px] font-black text-[#E0211F]">
                                Log Out
                            </Text>
                            <Text className="text-[11px] text-red-400 font-medium">
                                Sign out of account
                            </Text>
                        </View>
                    </View>

                    <Ionicons name="chevron-forward" size={16} color="#E0211F" />
                </TouchableOpacity>

                {/* App Version Info */}
                <View className="items-center mt-3">
                    <Text className="text-[11px] font-bold text-slate-400">
                        RTR Driver • v{appVersion}
                    </Text>
                </View>
            </View>

            {/* Logout Confirmation Dialog Modal */}
            <Modal
                transparent
                visible={logoutModalVisible}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-center items-center px-6">
                    <View className="w-full bg-white rounded-3xl p-6 items-center shadow-2xl">
                        <View className="w-16 h-16 rounded-full bg-red-50 border border-red-100 items-center justify-center mb-4">
                            <Ionicons name="log-out-outline" size={30} color="#E0211F" />
                        </View>

                        <Text className="text-[20px] font-black text-slate-900 mb-1.5 text-center">
                            Log Out?
                        </Text>
                        <Text className="text-[13px] text-slate-500 font-medium text-center leading-5 mb-6 px-2">
                            Are you sure you want to log out of RTR Driver? You will need to sign in again to book drivers.
                        </Text>

                        <View className="flex-row w-full gap-3">
                            <TouchableOpacity
                                onPress={() => setLogoutModalVisible(false)}
                                className="flex-1 h-12 rounded-xl bg-slate-100 items-center justify-center"
                                activeOpacity={0.8}
                                disabled={loggingOut}
                            >
                                <Text className="text-[14px] font-bold text-slate-700">
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={performLogout}
                                className="flex-1 h-12 rounded-xl bg-[#E0211F] items-center justify-center"
                                activeOpacity={0.8}
                                disabled={loggingOut}
                            >
                                {loggingOut ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text className="text-[14px] font-bold text-white">
                                        Yes, Log Out
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const DrawerNavigation = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: "front",
                drawerPosition: "right",
                drawerStyle: {
                    width: "82%",
                    maxWidth: 340,
                    backgroundColor: "#ffffff",
                    borderTopLeftRadius: 28,
                    borderBottomLeftRadius: 28,
                    overflow: "hidden",
                },
            }}
        >
            <Drawer.Screen
                name="Home"
                component={OwnerHome}
                options={{
                    drawerItemStyle: { display: "none" },
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
            />
            <Drawer.Screen
                name="Order History"
                component={OrderHistory}
            />
            <Drawer.Screen
                name="Statistics"
                component={Statistics}
            />
            <Drawer.Screen
                name="Invite Friends"
                component={MyReferal}
            />
            <Drawer.Screen
                name="Term & Condition"
                component={HelpAndFeedback}
            />
            <Drawer.Screen
                name="Contact Us"
                component={ContactUs}
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
                    <Stack.Screen name={"Googlemaps"} component={Googlemaps} />

                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    )
}

export default NavigationPage;