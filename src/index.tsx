import React, { useEffect } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "./utils/ColorCode";

const InitialPage = () => {
    const navigation: any = useNavigation();

    const fetchUserData = async () => {
        console.log("husahuha");
        
        try {
            const storedUserData: any = await AsyncStorage.getItem("UserData");
            console.log(storedUserData);
            
            if (storedUserData) {
                navigation.navigate("OwnerHome")
            } else {
                navigation.navigate("Onboard");
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <StatusBar backgroundColor={COLORS.primary} barStyle={'light-content'} />
    )
}

export default InitialPage;