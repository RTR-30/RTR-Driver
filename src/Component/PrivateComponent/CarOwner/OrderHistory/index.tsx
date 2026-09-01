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
import { BookingFeedbackService, FetchOrderHistory } from "./helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../../../Common/Loader";
import RenderOrderHistory from "./renderOrderHistory";
import { RefreshControl } from "react-native-gesture-handler";
import { noData } from "../../../../Common/Images";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";

const OrderHistory = () => {

    const value = "Order History";

    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [currentPageLimit, setCurrentPageLimit] = useState<any>(10);
    const [listData, setListData] = useState<any[]>([]);
    const [totalDataList, setTotalDataList] = useState<any>(null);

    const handleData = async (limit: any, page: any) => {
        if (footerLoader) {
            setShowLoading(false);
        } else {
            setShowLoading(true);
        }
        
        try {
            const response = await FetchOrderHistory(limit, page);
            const { data: { status = 0 } } = response;
            
            if (status === 200) {
                const bookingList = response.data.bookingList;
    
                const updatedList = await Promise.all(
                    bookingList.map(async (item: any, index: number) => {
                  
                      try {
                        const feedbackRes = await BookingFeedbackService(item.Id);
                        const feedbacks = feedbackRes?.data?.data || [];
                  
                        const feedbackGiven = feedbacks.some(
                          (feedback: any) => feedback.from_type === "user"
                        );
                  
                        return {
                          ...item,
                          feedbackGiven,
                        };
                      } catch (err) {
                        return {
                          ...item,
                          feedbackGiven: false,
                        };
                      }
                    })
                  );
    
                setListData(updatedList);
                setTotalDataList(response.data.total);
            }
        } catch (error) {
            showError(error);
        } finally {
            setShowLoading(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        }
    };
    
    const onRefresh = () => {
        setOnRefreshing(true);
        setShowLoading(false);
        setFooterLoader(false);
        setTotalDataList(null);
        setCurrentPageLimit(10);
        setListData([]);
        handleData(10, 1);
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
        handleData(currentPageLimit, 1)
    }, [currentPageLimit]);

    useEffect(()=>{
        handleData(currentPageLimit, 1);
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
                            renderItem={({ item }) => 
                                <RenderOrderHistory 
                                    item={item} 
                                    setShowLoading={setShowLoading}
                                    handleData={handleData}
                                    setCurrentPageLimit={setCurrentPageLimit} 
                                />
                            }
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