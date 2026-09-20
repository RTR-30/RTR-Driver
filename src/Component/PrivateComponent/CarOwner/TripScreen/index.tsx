import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    Modal,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator
} from "react-native";

import Header from "../../../../Common/Header/index";

import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import { tripTypeService } from "./helpder";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";
import Ionicons from "react-native-vector-icons/Ionicons";
import Loader from "../../../../Common/Loader";

const Thinking = require("../../../../../assets/Image/Thinking.png")

const TripScreen = () => {
    const navigation: any = useNavigation();
    const value = "Choose Trip";
    const [loader, setLoader] = useState<boolean>(false);
    const [triptypes, setTriptype] = useState<any>(null);

    const handleTripType = async (token: any) => {
        setLoader(true);
        try {
            const res = await tripTypeService(token)
            const { success, message, data } = res?.data;

            if (success === true) {
                setTriptype(data);
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem("UserData");
                const tokens = await AsyncStorage.getItem("token");
                if (storedUserData && tokens) {
                    handleTripType(tokens)
                }
            } catch (error) {
                console.error("Error fetching user data from AsyncStorage:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: COLORS.primary }}>
                <Header value={value} />
            </View>

            {loader ? (
                <View className="absolute justify-center items-center h-full w-full">
                    <Loader />
                </View>
            ) : null}
            <View className="flex-[9] bg-white rounded-t-[30px] w-full p-2">
                <FlatList
                    data={triptypes}
                    keyExtractor={(item: any) => item.id.toString()}
                    // contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{
                        justifyContent: "space-between",
                        padding: 10
                        // marginBottom: 15,
                    }}
                    numColumns={2}
                    renderItem={({ item }: any) => (
                        <View className="mt-3" style={{ width: '48%', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Booking", { TripDetails: item })}
                                style={{ elevation: 3 }}
                                className="bg-white w-[100%] p-2 border-black border-[0.5px] justify-center items-center shadow-md shadow-black rounded-tl-2xl rounded-br-2xl"
                            >
                                <Ionicons name="car-sport" size={30} color={"black"} />
                                <Text className="text-lg font-semibold text-center" style={{ color: COLORS.primary }}>{item.trip_type}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />


                {/* <View className="w-full h-[20%] justify-around items-center flex-row">
                    <TouchableOpacity onPress={()=>navigation.navigate("Booking", {TripMode:"Localstation"})} style={{ shadowColor: 'black', elevation: 3 }} className="w-[40%] h-[100px] rounded-[10px] justify-center items-center bg-white">
                        <Entypo name="location-pin" color={"black"} size={20} />
                        <Text className="text-center text-black text-[18px] font-bold mt-[10px]">Local Trip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate("Booking", {TripMode:"Outstation"})} style={{ shadowColor: 'black', elevation: 3 }} className="w-[40%] h-[100px] rounded-[10px] justify-center items-center bg-white">
                        <Entypo name="location" color={"black"} size={20} />
                        <Text className="text-center text-black text-[18px] font-bold mt-[10px]">Outstation Trip</Text>
                    </TouchableOpacity>
                </View>

                <View className="w-full h-[20%] justify-around items-center flex-row">
                    <TouchableOpacity onPress={()=>navigation.navigate("Booking", {TripMode:"LocalOnewayPickupDrop"})} style={{ shadowColor: 'black', elevation: 3 }} className="w-[40%] h-[100px] rounded-[10px] justify-center items-center bg-white">
                        <FontAwesome6 name="location-arrow" color={"black"} size={20}/>
                        <Text className="text-center text-black text-[18px] font-bold mt-[10px]">Local Oneway Pickup / Drop</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate("Booking", {TripMode:"OutstationOnewayPickupDrop"})} style={{ shadowColor: 'black', elevation: 3 }} className="w-[40%] h-[100px] rounded-[10px] justify-center items-center bg-white">
                        <FontAwesome6 name="location-arrow" color={"black"} size={20}/>
                        <Text className="text-center text-black text-[18px] font-bold mt-[10px]">Outstation Oneway Pickup / Drop</Text>
                    </TouchableOpacity>
                </View>

                <View className="w-full h-[60%] justify-center items-center">
                    <Image
                        source={Thinking}
                        className="w-full h-full"
                        resizeMode='contain'
                    />
                </View> */}
            </View>
        </View>
    );
};

export default TripScreen;