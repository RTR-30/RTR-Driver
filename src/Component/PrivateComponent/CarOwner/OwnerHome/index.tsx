import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Image,
    TouchableOpacity,
    Platform,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import DeviceInfo from "react-native-device-info";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";
import { userDataService } from "./helper";
import ForceUpdate from "../../../../Common/ForceUpdate";
import ExitAppModal from "../../../../Common/ExitAppModal";

const DrivingImg = require("../../../../../assets/Image/OwnerHomeImg.png");
const CheckListImg = require("../../../../../assets/Image/Checklist.png");

const OwnerHome = () => {
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState<boolean>(false);
    const [appVersion, setAppVersion] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [updatedAppVersion, setUpdatedAppVersion] = useState<any>(null);

    const platformVersion = Platform.OS === "android" ? updatedAppVersion?.android : updatedAppVersion?.ios;

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const res = await userDataService();
                const { data: { app_versions = {}, success = false, user = {} } } = res;
                if (success === true) {
                    setUserData(user);
                    setUpdatedAppVersion(app_versions);
                } else {
                    showError("user data error");
                }
            } catch (error) {
                showError(error);
            } finally {
                setLoading(false);
            }
        };

        const version = DeviceInfo.getVersion();
        setAppVersion(version);
        fetchUserData();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-[#E0211F]">
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <View className="flex-1">
                {/* Header Bar */}
                <View className="h-[60px] bg-[#E0211F] justify-center">
                    <View className="w-full flex-row items-center px-4">
                        <View className="w-[15%]" />

                        <View className="flex-1 flex-row justify-center items-center">
                            <Text className="text-white text-[19px] font-black tracking-tight">RTR Driver</Text>
                            <FontAwesome5 name="car" color={"white"} size={22} style={{ marginLeft: 8 }} />
                        </View>

                        <View className="w-[15%] items-end justify-center">
                            <TouchableOpacity
                                onPress={() => navigation.openDrawer()}
                                className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center active:bg-white/30"
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Entypo name="menu" size={24} color={"white"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Content Area */}
                <View className="flex-1 bg-slate-50 rounded-t-[28px] overflow-hidden justify-between p-4">
                    <View className="flex-row w-full justify-around mt-4">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Googlemaps")}
                            style={{ elevation: 3 }}
                            className="w-[45%] h-[155px] rounded-3xl justify-center items-center bg-white border border-slate-100 p-2"
                            activeOpacity={0.8}
                        >
                            <Image source={DrivingImg} className="w-full h-[75%]" resizeMode="contain" />
                            <Text className="text-center text-slate-800 text-[15px] font-bold mt-1">Acting Driving</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("BookingList", { user: userData?.Id })}
                            style={{ elevation: 3 }}
                            className="w-[45%] h-[155px] rounded-3xl justify-center items-center bg-white border border-slate-100 p-2"
                            activeOpacity={0.8}
                        >
                            <Image source={CheckListImg} className="w-full h-[75%]" resizeMode="contain" />
                            <Text className="text-center text-slate-800 text-[15px] font-bold mt-1">Booking Updates</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Version Footer */}
                    <View className="items-center pb-2">
                        <Text className="text-[12px] font-bold text-slate-400">v - {appVersion}</Text>
                    </View>
                </View>
            </View>

            <ForceUpdate
                latestVersion={platformVersion?.latest_version}
            />

            {/* Back Handler Exit App Modal */}
            <ExitAppModal />
        </SafeAreaView>
    );
};

export default OwnerHome;