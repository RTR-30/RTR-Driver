import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    FlatList,
    ToastAndroid,
    ActivityIndicator,
    Image
} from "react-native";
import Header from "../../../../Common/Header/index";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { FetchOrderHistory } from "./helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../../../Common/Loader";
import RenderOrderHistory from "./renderOrderHistory";
import { RefreshControl } from "react-native-gesture-handler";
import { noData } from "../../../../Common/Images";
import { COLORS } from "../../../../utils/ColorCode";

const OrderHistory = () => {

    const value = "Order History";
    const [tokens, setTokens] = useState<any>(null);

    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [currentPageLimit, setCurrentPageLimit] = useState<any>(10);
    const [listData, setListData] = useState<any[]>([]);
    const [totalDataList, setTotalDataList] = useState<any>(null);

    const handleData = async (token: any, limit: any, page: any) => {
        if (footerLoader) {
            setShowLoading(false);
            // setFooterLoader(false);
        } else {
            setShowLoading(true);
        }

        try {
            const response = await FetchOrderHistory(token, limit, page);
         
            setListData(response.data.bookingList);
            setTotalDataList(response?.data.total);
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
            const tokens: any = await AsyncStorage.getItem("token");

            if (tokens) {
                setTokens(tokens);
                handleData(tokens, currentPageLimit, 1);
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
            handleData(tokens, currentPageLimit, 1).catch(() => {
                ToastAndroid.show("Check Internet Connection", ToastAndroid.SHORT);
            }).finally(() => {
                setShowLoading(false);
                setOnRefreshing(false);
                setFooterLoader(false);
            })
        })
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

    const loadMore = () => {
        setCurrentPageLimit(currentPageLimit + 10);
        setFooterLoader(true);
    }

    useEffect(() => {
        handleData(tokens, currentPageLimit, 1)
    }, [currentPageLimit]);

    // useFocusEffect(
    //     React.useCallback(() => {
    //         fetchUserData();
    //         return () => {
    //             console.log("OrderHistory screen unfocused");
    //         };
    //     }, [])
    // );

    useEffect(()=>{
        fetchUserData();
    },[])

    return (
        <View className="flex-1" style={{backgroundColor:COLORS.primary}}>
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

            <View className="flex-1 bg-[#5a639c]">
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
                    <View className="flex-[9] bg-white rounded-t-[30px] p-4">
                        <FlatList
                            data={listData}
                            renderItem={({ item }) => <RenderOrderHistory item={item} setShowLoading={setShowLoading} />}
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

export default OrderHistory;