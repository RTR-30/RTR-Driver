import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import Header from "../../../../Common/Header/index";
import { useNavigation } from "@react-navigation/native";
import { BookingFeedbackService, FetchOrderHistory } from "./helper";
import Loader from "../../../../Common/Loader";
import RenderOrderHistory from "./renderOrderHistory";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";
import Ionicons from "react-native-vector-icons/Ionicons";

type FilterType = "ALL" | "CLOSED" | "CANCELLED";

const OrderHistory = () => {
    const navigation: any = useNavigation();
    const value = "Order History";

    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [currentPageLimit, setCurrentPageLimit] = useState<number>(10);
    const [listData, setListData] = useState<any[]>([]);
    const [totalDataList, setTotalDataList] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

    const handleData = async (limit: number, page: number, isRefresh = false) => {
        if (!isRefresh && !footerLoader) {
            setShowLoading(true);
        }

        try {
            const response = await FetchOrderHistory(limit, page);
            const { data: { status = 0 } } = response;
            console.log(JSON.stringify(response));
    
            if (status === 200) {
                const bookingList = response.data?.bookingList || [];

                const updatedList = await Promise.all(
                    bookingList.map(async (item: any) => {
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
                setTotalDataList(response.data?.total || updatedList.length);
            }
        } catch (error) {
            showError(error);
        } finally {
            setShowLoading(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        }
    };

    const onRefresh = useCallback(() => {
        setOnRefreshing(true);
        setFooterLoader(false);
        setCurrentPageLimit(10);
        handleData(10, 1, true);
    }, []);

    const loadMore = () => {
        if (footerLoader || showLoading) return;
        if (totalDataList !== null && listData.length >= totalDataList) return;
        const nextLimit = currentPageLimit + 10;
        setCurrentPageLimit(nextLimit);
        setFooterLoader(true);
        handleData(nextLimit, 1);
    };

    useEffect(() => {
        handleData(currentPageLimit, 1);
    }, []);

    const filteredData = useMemo(() => {
        return listData.filter((item) => {
            const lower = item?.Status?.toLowerCase() || "";
            if (activeFilter === "CLOSED") {
                return lower === "closed" || lower === "completed";
            }
            if (activeFilter === "CANCELLED") {
                return lower === "cancelled" || lower === "rejected";
            }
            return true;
        });
    }, [listData, activeFilter]);

    const counts = useMemo(() => {
        const total = listData.length;
        const closed = listData.filter((i) => {
            const lower = i?.Status?.toLowerCase() || "";
            return lower === "closed" || lower === "completed";
        }).length;
        const cancelled = listData.filter((i) => {
            const lower = i?.Status?.toLowerCase() || "";
            return lower === "cancelled" || lower === "rejected";
        }).length;
        return { total, closed, cancelled };
    }, [listData]);

    const renderLoader = () => {
        if (!footerLoader) return null;
        return (
            <View className="items-center justify-center py-4">
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    const renderFilterTabs = () => {
        if (listData.length === 0) return null;

        return (
            <View className="flex-row items-center px-4 pt-4 pb-2 gap-2">
                <TouchableOpacity
                    onPress={() => setActiveFilter("ALL")}
                    className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                        activeFilter === "ALL" ? "bg-[#E0211F] border-[#E0211F]" : "bg-white border-slate-200"
                    }`}
                    activeOpacity={0.7}
                >
                    <Text
                        className={`text-[12px] font-bold mr-1.5 ${
                            activeFilter === "ALL" ? "text-white" : "text-slate-500"
                        }`}
                    >
                        All
                    </Text>
                    <View
                        className={`px-1.5 py-0.5 rounded-full ${
                            activeFilter === "ALL" ? "bg-white/25" : "bg-slate-100"
                        }`}
                    >
                        <Text
                            className={`text-[11px] font-extrabold ${
                                activeFilter === "ALL" ? "text-white" : "text-slate-600"
                            }`}
                        >
                            {counts.total}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveFilter("CLOSED")}
                    className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                        activeFilter === "CLOSED" ? "bg-[#E0211F] border-[#E0211F]" : "bg-white border-slate-200"
                    }`}
                    activeOpacity={0.7}
                >
                    <Text
                        className={`text-[12px] font-bold mr-1.5 ${
                            activeFilter === "CLOSED" ? "text-white" : "text-slate-500"
                        }`}
                    >
                        Completed
                    </Text>
                    <View
                        className={`px-1.5 py-0.5 rounded-full ${
                            activeFilter === "CLOSED" ? "bg-white/25" : "bg-slate-100"
                        }`}
                    >
                        <Text
                            className={`text-[11px] font-extrabold ${
                                activeFilter === "CLOSED" ? "text-white" : "text-slate-600"
                            }`}
                        >
                            {counts.closed}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveFilter("CANCELLED")}
                    className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                        activeFilter === "CANCELLED" ? "bg-[#E0211F] border-[#E0211F]" : "bg-white border-slate-200"
                    }`}
                    activeOpacity={0.7}
                >
                    <Text
                        className={`text-[12px] font-bold mr-1.5 ${
                            activeFilter === "CANCELLED" ? "text-white" : "text-slate-500"
                        }`}
                    >
                        Cancelled
                    </Text>
                    <View
                        className={`px-1.5 py-0.5 rounded-full ${
                            activeFilter === "CANCELLED" ? "bg-white/25" : "bg-slate-100"
                        }`}
                    >
                        <Text
                            className={`text-[11px] font-extrabold ${
                                activeFilter === "CANCELLED" ? "text-white" : "text-slate-600"
                            }`}
                        >
                            {counts.cancelled}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyComponent = () => {
        if (showLoading) return null;

        if (listData.length === 0) {
            return (
                <View className="flex-1 items-center justify-center py-16 px-6">
                    <View
                        className="w-[76px] h-[76px] rounded-full bg-white justify-center items-center mb-4 border border-slate-100"
                        style={{ elevation: 2 }}
                    >
                        <Ionicons name="receipt-outline" size={42} color="#94a3b8" />
                    </View>
                    <Text className="text-[17px] font-extrabold text-slate-900 mb-1.5 text-center">
                        No Order History Found
                    </Text>
                    <Text className="text-[13px] text-slate-500 text-center leading-[19px] mb-5">
                        You haven't completed or cancelled any trips yet. Once you take a ride, your booking summaries and invoices will appear here.
                    </Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-[#E0211F] py-2.5 px-5 rounded-full"
                        style={{ elevation: 3 }}
                        onPress={() => navigation.navigate("OwnerHome")}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="car-outline" size={17} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text className="text-[14px] font-bold text-white">Book a Driver</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View className="flex-1 items-center justify-center py-16 px-6">
                <View
                    className="w-[76px] h-[76px] rounded-full bg-white justify-center items-center mb-4 border border-slate-100"
                    style={{ elevation: 2 }}
                >
                    <Ionicons name="filter-outline" size={38} color="#94a3b8" />
                </View>
                <Text className="text-[17px] font-extrabold text-slate-900 mb-1.5 text-center">
                    {activeFilter === "CLOSED" ? "No Completed Trips" : "No Cancelled Trips"}
                </Text>
                <Text className="text-[13px] text-slate-500 text-center leading-[19px] mb-5">
                    There are no trips matching the selected filter.
                </Text>
                <TouchableOpacity
                    className="py-2 px-4 rounded-lg bg-slate-100"
                    onPress={() => setActiveFilter("ALL")}
                    activeOpacity={0.8}
                >
                    <Text className="text-[13px] font-bold text-[#E0211F]">Show All Orders</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#E0211F]">
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {showLoading && <Loader />}

            {/* Screen Header */}
            <View className="h-[60px] justify-center items-center bg-[#E0211F]">
                <Header value={value} />
            </View>

            {/* Main Content Area */}
            <View className="flex-1 bg-slate-50 rounded-t-[28px] overflow-hidden">
                {renderFilterTabs()}

                <FlatList
                    data={filteredData}
                    renderItem={({ item }) => (
                        <RenderOrderHistory
                            item={item}
                            setShowLoading={setShowLoading}
                            handleData={handleData}
                            setCurrentPageLimit={setCurrentPageLimit}
                        />
                    )}
                    keyExtractor={(item, index) => (item?.Id ? item.Id.toString() : index.toString())}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyComponent}
                    ListFooterComponent={renderLoader}
                    refreshControl={
                        <RefreshControl
                            refreshing={onRefreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 8,
                        paddingBottom: 28,
                        gap: 12,
                        flexGrow: 1,
                    }}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                />
            </View>
        </View>
    );
};

export default OrderHistory;