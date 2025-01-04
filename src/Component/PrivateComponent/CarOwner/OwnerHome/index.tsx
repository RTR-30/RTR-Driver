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

const DrivingImg = require("../../../../../assets/Image/OwnerHomeImg.png");
const CheckListImg = require("../../../../../assets/Image/Checklist.png");

const OwnerHome = () => {
    const navigation = useNavigation();

    const [userData, setUserData] = useState<any>(null);

    console.log('====================================');
    console.log(userData);
    console.log('====================================');

    useEffect(()=>{
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

        fetchUserData();
    },[])
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5a639c' }}>
            <StatusBar backgroundColor={"#5a639c"} barStyle={"dark-content"} />
            <View>
                <View style={{ flex: 1, backgroundColor: '#5a639c' }}>
                    <View style={{ height: '100%', width: '100%', flexDirection: 'row' }}>
                        <View style={{ width: '15%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        </View>

                        <View style={{ width: '70%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>Drive4U</Text>
                            <FontAwesome5 name="car" color={"black"} size={24} style={{ marginLeft: 10 }} />
                        </View>

                        <View style={{ width: '15%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Entypo name="menu" size={24} color={"black"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ flex: 9, backgroundColor: 'white', borderTopStartRadius: 40, borderTopEndRadius: 40, padding: 10 }}>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 10 }}>
                        <TouchableOpacity onPress={() => navigation.navigate("Trip")} style={{ width: '40%', height: 150, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: 'black', elevation: 3, backgroundColor:'#fff' }}>
                            <Image source={DrivingImg} style={{ width: '100%', height: '80%' }} />

                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontWeight: 'bold' }}>Acting Driving</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>navigation.navigate("BookingList", {user:userData.id})} style={{ width: '40%', height: 150, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: 'black', elevation: 3, backgroundColor:'#fff' }}>
                            <Image source={CheckListImg} style={{ width: '100%', height: '80%' }} />

                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontWeight: 'bold' }}>Booking Updates</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default OwnerHome;