import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    FlatList,
} from "react-native";
import Header from "../../../../Common/Header";
import { FetchBookingList } from "./helper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import RenderBookingList from "./renderBookingList";
import Loader from "../../../../Common/Loader/index";

const BookingList = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { user }: any = route.params || {}; // Corrected destructuring syntax

    const value = "Booking Updates";
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [listData, setListData] = useState<any[]>([]);
   
    const handleData = async () => {
        setShowLoading(true);
        try {
            const response = await FetchBookingList(user);
            setListData(response.data || []);
        } catch (error) {
            console.error("Error fetching booking list:", error);
        } finally {
            setShowLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("UserData");
            if (storedUserData) {
                await handleData();
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: "#5a639c" }}>
            <StatusBar backgroundColor={"#5a639c"} barStyle={"dark-content"} />

            {showLoading && (
                <View
                    style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        zIndex: 10,
                    }}
                >
                    <Loader />
                </View>
            )}

            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Header value={value} />
            </View>

            <View
                style={{
                    flex: 9,
                    backgroundColor: "white",
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    padding: 16,
                }}
            >
                <FlatList
                    data={listData}
                    renderItem={({ item }) => <RenderBookingList item={item} />}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingVertical: 16,
                        gap: 16,
                    }}
                />
            </View>
        </View>
    );
};

export default BookingList;
