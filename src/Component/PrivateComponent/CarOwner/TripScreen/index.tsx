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
                console.log(message);
            }
        } catch (error) {
            console.log(error);

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
        <View className="flex-1" style={{backgroundColor: COLORS.primary}}>
            <View className="flex-1 justify-center items-center" style={{backgroundColor: COLORS.primary}}>
                <Header value={value} />
            </View>

            <View className="flex-[9] bg-white rounded-t-[30px] w-full p-2">
                {loader ? (
                    <View className="absolute justify-center items-center h-full w-full">
                        <ActivityIndicator color={"red"} size={"large"} />
                    </View>
                ) : null}
                <FlatList
                    data={triptypes}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{
                        justifyContent: "space-between",
                        marginBottom: 15,
                    }}
                    numColumns={2}
                    renderItem={({ item }: any) => (
                        <View style={{height:100, width:'40%', justifyContent:'center', alignItems:'center'}}>
                        <TouchableOpacity
                            onPress={()=>navigation.navigate("Booking", {TripDetails:item})}
                            className="bg-white w-[100%] h-[100%] mb-15 p-15 rounded-2xl border border-black flex-row justify-center items-center"
                        >
                            <View>
                                <Text className="text-lg font-semibold text-center text-black">
                                    {item.trip_type}
                                </Text>
                            </View>
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