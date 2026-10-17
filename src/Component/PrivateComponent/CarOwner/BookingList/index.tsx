import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    StatusBar,
    RefreshControl,
} from "react-native";
import Header from "../../../../Common/Header";
import { FetchBookingList } from "./helper";
import RenderBookingList from "./renderBookingList";
import Loader from "../../../../Common/Loader/index";
import { COLORS } from "../../../../utils/ColorCode";
import Ionicons from "react-native-vector-icons/Ionicons";

const BookingList = () => {
    const navigation = useNavigation();
    const value = "Booking Updates";

    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [currentPageLimit, setCurrentPageLimit] = useState<number>(10);
    const [listData, setListData] = useState<any[]>([]);
    const [totalDataList, setTotalDataList] = useState<number | null>(null);

    const handleData = async (limit: number, page: number, isRefresh = false) => {
        if (!isRefresh && !footerLoader) {
            setShowLoading(true);
        }

        try {
            const response = await FetchBookingList(limit, page);
            const total = response?.data?.total || 0;
            const bookings = response?.data?.bookingList || [];
            setTotalDataList(total);
            setListData(bookings);
        } catch (error) {
            console.error("Error fetching booking list:", error);
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
        if (totalDataList !== null && listData.length >= totalDataList) return;
        if (footerLoader) return;
        const nextLimit = currentPageLimit + 10;
        setCurrentPageLimit(nextLimit);
        setFooterLoader(true);
        handleData(nextLimit, 1);
    };

    const renderLoader = () => {
        if (!footerLoader) return null;
        return (
            <View style={styles.footerLoaderWrap}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    const renderHeaderInfo = () => {
        if (listData.length === 0) return null;
        return (
            <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderText}>Active Bookings</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{listData.length}</Text>
                </View>
            </View>
        );
    };

    const renderEmptyComponent = () => {
        if (showLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <Ionicons name="calendar-outline" size={38} color="#94a3b8" />
                </View>
                <Text style={styles.emptyTitle}>No Booking Updates</Text>
                <Text style={styles.emptySubtitle}>
                    You have no active bookings right now. New bookings will appear here.
                </Text>
            </View>
        );
    };

    useEffect(() => {
        handleData(currentPageLimit, 1);
    }, []);

    return (
        <View style={styles.rootContainer}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {showLoading && (
                <View style={styles.loaderOverlay}>
                    <Loader />
                </View>
            )}

            {/* Screen Header */}
            <View style={styles.headerWrapper}>
                <Header value={value} />
            </View>

            {/* Main Content Area */}
            <View style={styles.contentContainer}>
                <FlatList
                    data={listData}
                    renderItem={({ item }) => <RenderBookingList item={item} onRefresh={onRefresh} />}
                    keyExtractor={(item, index) => item?.Id ? item.Id.toString() : index.toString()}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={renderHeaderInfo}
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
                    contentContainerStyle={styles.listContent}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                />
            </View>
        </View>
    );
};

export default BookingList;

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    headerWrapper: {
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.primary,
    },
    loaderOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },
    listHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    listHeaderText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
    },
    countBadge: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: "800",
        color: COLORS.primary,
    },
    footerLoaderWrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 13,
        color: "#64748b",
        textAlign: "center",
        paddingHorizontal: 24,
        lineHeight: 18,
    },
});
