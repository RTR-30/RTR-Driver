import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    FlatList,
    ActivityIndicator,
    ToastAndroid,
    Image
} from "react-native";
import Header from "../../../../Common/Header";
import { FetchBookingList } from "./helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RefreshControl } from "react-native-gesture-handler";

import RenderBookingList from "./renderBookingList";
import Loader from "../../../../Common/Loader/index";
import { noData } from "../../../../Common/Images";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";

const BookingList = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [token, setToken] = useState<any>(null);

    const value = "Booking Updates";

    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [currentPageLimit, setCurrentPageLimit] = useState<any>(10);
    const [listData, setListData] = useState<any[]>([]);
    const [totalDataList, setTotalDataList] = useState<any>(null);

    const handleData = async (token: any, limit: any, page: any) => {
        if (footerLoader) {
            setShowLoading(false);
        } else {
            setShowLoading(true);
        }

        try {
            const response = await FetchBookingList(token, limit, page);
            setTotalDataList(response.data.total)
            setListData(response.data.bookingList);
        } catch (error) {
            console.error("Error fetching booking list:", error);
        } finally {
            setShowLoading(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("UserData");
            const tokens: any = await AsyncStorage.getItem("token");
            if (storedUserData || tokens) {
                setToken(tokens);
                await handleData(tokens, currentPageLimit, 1);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

    const onRefresh = () => {
        setOnRefreshing(true);
        setShowLoading(false);
        setFooterLoader(false);
        setTotalDataList(null);
        setCurrentPageLimit(10);
        setListData([]);
        fetchUserData().then(() => {
            handleData(token, currentPageLimit, 1).catch(() => {
                showError("Check Internet Connection");
            }).finally(() => {
                setShowLoading(false);
                setOnRefreshing(false);
                setFooterLoader(false);
            })
        })
    }

    const loadMore = () => {
        setCurrentPageLimit(currentPageLimit + 10);
        setFooterLoader(true);
    }

    const renderLoader = () => {
        
        return (
            totalDataList !== listData.length && (
                <View className="items-center my-[16px] h-[20px]">
                    {
                        footerLoader && <ActivityIndicator size={"large"} color={"#5a639c"} />
                    }
                </View>
            )
        )
    }

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.primary }}>

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

            {
                listData.length === 0 && !showLoading ? (
                    <View className="flex-[9] bg-white justify-center items-center rounded-t-[40px]">
                        <View className="w-[100%] h-[50%] justify-center items-center">
                            <Image
                                source={noData}
                                className={"w-full h-full"}
                            />
                        </View>
                    </View>
                ) : (
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
                            renderItem={({ item }) => <RenderBookingList item={item} token={token} handleData={handleData} />}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={onRefreshing} onRefresh={onRefresh} tintColor={"#6200EE"} />}
                            contentContainerStyle={{
                                // paddingVertical: 16,
                                gap: 10,
                            }}
                            ListFooterComponent={renderLoader}
                            onEndReached={loadMore}
                            onEndReachedThreshold={0}
                        />
                    </View>
                )
            }
        </View>
    );
};

export default BookingList;
