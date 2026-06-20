import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Image,
    TouchableOpacity
} from "react-native";

import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import { COLORS } from "../../../../utils/ColorCode";

const DrivingImg = require("../../../../../assets/Image/OwnerHomeImg.png");
const CheckListImg = require("../../../../../assets/Image/Checklist.png");

const OwnerHome = () => {
    const navigation:any = useNavigation();

    const [appVersion, setAppVersion] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem("UserData");
                if (storedUserData) {
                    setUserData(JSON.parse(storedUserData));
                }
            } catch (error) {
                console.error("Error fetching user data from AsyncStorage:", error);
            }
        };

        const appVersion = DeviceInfo.getVersion(); // Gets versionName from build.gradle
        setAppVersion(appVersion)

        fetchUserData();
    }, [])
    return (
        <SafeAreaView className="flex-1 justify-center items-center" style={{backgroundColor: COLORS.primary}}>
            
            <View>
                <View className="flex-1" style={{backgroundColor: COLORS.primary}}>
                    <View className="h-full w-full flex-row">
                        <View className="w-[15%] h-full justify-center items-center">
                            {/* add any item */}
                        </View>

                        <View className="w-[70%] flex-row h-full justify-center items-center">
                            <Text className="text-black text-[18px] font-bold" style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>RTR Driver</Text>
                            <FontAwesome5 name="car" color={"white"} size={24} style={{ marginLeft: 10 }} />
                        </View>

                        <View className="w-[15%] h-full justify-center items-center">
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Entypo name="menu" size={24} color={"white"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="flex-[9] bg-white rounded-t-[30px] p-1">
                    <View className="flex-row w-full justify-around mt-5">
                        <TouchableOpacity onPress={() => navigation.navigate("Trip")}
                            style={{ shadowColor: 'black', elevation: 3 }}
                            className="w-[40%] h-[150px] rounded-3xl justify-center items-center bg-white"
                        >
                            <Image source={DrivingImg} className="w-full h-[80%]" />

                            <Text className="text-center text-black text-[16px] font-bold">Acting Driving</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("BookingList", { user: userData.id })}
                            style={{ shadowColor: 'black', elevation: 3 }}
                            className="w-[40%] h-[150px] rounded-3xl justify-center items-center bg-white"
                        >
                            <Image source={CheckListImg} className="w-full h-[80%]" />

                            <Text className="text-center text-black text-[16px] font-bold">Booking Updates</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <View className="bg-white flex-[0.5] justify-center items-center">
                    <Text style={{color: COLORS.primary}} className="text-center text-[14px] font-bold">v - {appVersion}</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default OwnerHome;