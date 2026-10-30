import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    StyleSheet,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../../Common/Header/index";
import { useNavigation, useRoute } from "@react-navigation/native";
import { tripTypeService } from "./helpder";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";
import Ionicons from "react-native-vector-icons/Ionicons";
import Loader from "../../../../Common/Loader";

const TripScreen = () => {
    const navigation: any = useNavigation();
    const route: any = useRoute();
    const { address, coordinate }: any = route?.params || {};
    const value = "Choose Trip";

    const [loader, setLoader] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [triptypes, setTriptype] = useState<any[] | null>(null);

    const handleTripType = async (token: any, isRefresh = false) => {
        if (!isRefresh) setLoader(true);
        try {
            const res = await tripTypeService(token);
            const { success, message, data } = res?.data || {};

            if (success === true) {
                setTriptype(data);
            } else {
                showError(message || "Failed to load trip types");
            }
        } catch (error: any) {
            showError(error?.message || "Network error loading trip types");
        } finally {
            setLoader(false);
            setRefreshing(false);
        }
    };

    const fetchUserData = async (isRefresh = false) => {
        try {
            const tokens = await AsyncStorage.getItem("token");
            if (tokens) {
                handleTripType(tokens, isRefresh);
            } else {
                setLoader(false);
                setRefreshing(false);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
            setLoader(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserData(true);
    }, []);

    // Parse API trip_type_description if provided in response
    const parseDescription = (item: any) => {
        if (!item?.trip_type_description) return null;
        try {
            const parsed = JSON.parse(item.trip_type_description);
            if (Array.isArray(parsed)) {
                return parsed.join(" • ");
            }
            if (typeof parsed === "string") {
                return parsed;
            }
        } catch {
            return item.trip_type_description;
        }
        return null;
    };

    const renderTripCard = ({ item }: { item: any }) => {
        const description = parseDescription(item);

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("Booking", { TripDetails: item, address, coordinate })}
                style={styles.card}
            >
                {/* Left Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name="car-sport" size={24} color={COLORS.primary} />
                </View>

                {/* Center Content from API response */}
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.trip_type}</Text>
                    {description ? (
                        <Text style={styles.cardDesc} numberOfLines={2}>
                            {description}
                        </Text>
                    ) : null}
                </View>

                {/* Right Price & Arrow */}
                <View style={styles.rightActionWrap}>
                    {item.total_amount ? (
                        <Text style={styles.priceText}>₹{item.total_amount}</Text>
                    ) : item.driver_charge ? (
                        <Text style={styles.priceText}>₹{item.driver_charge}</Text>
                    ) : null}
                    <View style={styles.arrowCircle}>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeaderComponent = () => {
        if (!address) return null;
        return (
            <View style={styles.locationBarCard}>
                <View style={styles.locationIconWrap}>
                    <Ionicons name="location-sharp" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.locationTextWrap}>
                    <Text style={styles.locationLabel}>PICKUP LOCATION</Text>
                    <Text style={styles.locationAddressText} numberOfLines={1}>
                        {address}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.locationChangeBtn}
                    onPress={() => navigation.navigate("Googlemaps")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.locationChangeText}>Change</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyComponent = () => {
        if (loader) return null;
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <Ionicons name="car-outline" size={38} color="#94a3b8" />
                </View>
                <Text style={styles.emptyTitle}>No Trip Types Available</Text>
                <Text style={styles.emptySubtitle}>
                    Pull down to refresh or check back later.
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.rootContainer} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Screen Header */}
            <View style={styles.headerWrapper}>
                <Header value={value} />
            </View>

            {loader && (
                <View style={styles.loaderOverlay}>
                    <Loader />
                </View>
            )}

            {/* Main Content Area */}
            <SafeAreaView edges={['bottom']} style={styles.contentContainer}>
                <FlatList
                    data={triptypes}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={renderTripCard}
                    ListHeaderComponent={renderHeaderComponent}
                    ListEmptyComponent={renderEmptyComponent}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            </SafeAreaView>
        </SafeAreaView>
    );
};

export default TripScreen;

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

    // Pickup Location Card
    locationBarCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },
    locationIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    locationTextWrap: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 10,
        fontWeight: "800",
        color: "#64748b",
        letterSpacing: 0.5,
    },
    locationAddressText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0f172a",
        marginTop: 1,
    },
    locationChangeBtn: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: "#fee2e2",
        borderRadius: 8,
        marginLeft: 8,
    },
    locationChangeText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.primary,
    },

    // Trip Card Styles (Mapped exclusively from API response)
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    cardContent: {
        flex: 1,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 12,
        color: "#64748b",
        lineHeight: 16,
        marginTop: 2,
    },
    rightActionWrap: {
        flexDirection: "row",
        alignItems: "center",
    },
    priceText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0f172a",
        marginRight: 8,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
    },

    // Empty State
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 50,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 13,
        color: "#64748b",
        textAlign: "center",
        paddingHorizontal: 20,
    },
});