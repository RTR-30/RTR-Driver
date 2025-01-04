import React, { useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    Modal,
    TouchableWithoutFeedback
} from "react-native";

import Header from "../../../../Common/Header/index";

import Entypo from "react-native-vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";

const Thinking = require("../../../../../assets/Image/Thinking.png")

const TripScreen = () => {
    const navigation = useNavigation();
    const value = "Choose Trip"

    return (
        <View style={{ flex: 1, backgroundColor: '#5a639c' }}>
            <StatusBar backgroundColor={"#5a639c"} barStyle={"dark-content"} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5a639c' }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, backgroundColor: 'white', borderTopStartRadius: 40, borderTopEndRadius: 40, width: '100%' }}>
                <View style={{ width: '100%', height: '20%', justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={()=>navigation.navigate("Booking", {TripMode:"Localstation"})} style={{ width: '40%', height: 100, borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: 'black', elevation: 3, backgroundColor: 'white' }}>
                        <Entypo name="location-pin" color={"black"} size={20} />
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Local Trip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate("Booking", {TripMode:"Outstation"})} style={{ width: '40%', height: 100, borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: 'black', elevation: 3, backgroundColor: 'white' }}>
                        <Entypo name="location" color={"black"} size={20} />
                        <Text style={{ textAlign: 'center', color: 'black', fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Outstation Trip</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={Thinking}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode='contain'
                    />
                </View>
            </View>
        </View>
    );
};

export default TripScreen;