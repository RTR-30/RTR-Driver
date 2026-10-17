import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getDriverinfoService, UpdateBooking } from "./helper";
import DriverInfoModal from "./DriverInfoModal";
import { showError, showSuccess } from "../../../../Common/ToastMessage";
import { COLORS } from "../../../../utils/ColorCode";

const RenderBookingList = ({ item, onRefresh }: any) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [partnerDetails, setPartnerDetails] = useState(null);

    const getDriverDetails = async (bookingId: any) => {
        try {
            const res = await getDriverinfoService(bookingId);
            if (res?.data?.success === true) {
                const { partnerDetails: details } = res?.data;
                setPartnerDetails(details);
                setModalVisible(true);
            } else {
                showError("Driver details not available yet");
            }
        } catch (error: any) {
            showError(error?.message || "Could not fetch driver details");
        }
    };

    const updateBooklist = async () => {
        const data = {
            bookingId: item?.Id,
        };

        try {
            const res = await UpdateBooking(data);
            const { data: { message = "", success = false } } = res;
            if (success) {
                showSuccess(message || "Booking cancelled successfully");
                onRefresh();
            } else {
                showError(message || "Failed to cancel booking");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to cancel booking");
        }
    };

    const formatDateTime = (dateTime: any) => {
        if (!dateTime) return "";
        const parsedDate = new Date(dateTime);
        if (isNaN(parsedDate.getTime())) return String(dateTime);
        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const showCancelAlert = () => {
        Alert.alert(
            "Cancel Booking",
            "Are you sure you want to cancel this booking?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes, Cancel", style: "destructive", onPress: () => updateBooklist() },
            ]
        );
    };

    // Dynamic status badge styling based on API response
    const getStatusStyle = (status: string) => {
        const lower = status?.toLowerCase() || "";
        if (lower === "created" || lower === "pending") {
            return {
                bg: "#fef3c7",
                text: "#b45309",
                label: status || "Created",
                icon: "time-outline",
            };
        }
        if (lower === "accepted") {
            return {
                bg: "#e0e7ff",
                text: "#4338ca",
                label: "Accepted",
                icon: "checkmark-circle-outline",
            };
        }
        if (lower === "inprogress" || lower === "in progress" || lower === "started") {
            return {
                bg: "#dbeafe",
                text: "#1d4ed8",
                label: "In Progress",
                icon: "car-outline",
            };
        }
        if (lower === "completed") {
            return {
                bg: "#dcfce7",
                text: "#15803d",
                label: "Completed",
                icon: "checkmark-done-circle-outline",
            };
        }
        if (lower === "cancelled" || lower === "rejected") {
            return {
                bg: "#fee2e2",
                text: "#b91c1c",
                label: "Cancelled",
                icon: "close-circle-outline",
            };
        }
        return {
            bg: "#f1f5f9",
            text: "#475569",
            label: status || "Update",
            icon: "information-circle-outline",
        };
    };

    const statusConfig = getStatusStyle(item?.Status);
    const isPaid = item?.PaymentStatus?.toLowerCase() === "paid";

    return (
        <View style={styles.card}>
            {/* Top Bar: Booking ID & Badges */}
            <View style={styles.cardTopRow}>
                <View style={styles.bookingIdWrap}>
                    <Text style={styles.bookingIdText}>Booking #{item?.Id}</Text>
                </View>

                <View style={styles.badgesRightRow}>
                    {/* Payment Status Pill */}
                    {item?.PaymentStatus ? (
                        <View style={[styles.pillBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
                            <Text style={[styles.pillBadgeText, isPaid ? styles.paidBadgeText : styles.unpaidBadgeText]}>
                                {item?.PaymentStatus}
                            </Text>
                        </View>
                    ) : null}

                    {/* Booking Status Pill */}
                    <View style={[styles.pillBadge, { backgroundColor: statusConfig.bg, marginLeft: 6 }]}>
                        <Ionicons name={statusConfig.icon as any} size={13} color={statusConfig.text} style={{ marginRight: 3 }} />
                        <Text style={[styles.pillBadgeText, { color: statusConfig.text }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardDivider} />

            {/* Customer Details */}
            <View style={styles.detailsSection}>
                {/* Name & Phone */}
                <View style={styles.infoRow}>
                    <View style={styles.infoIconWrap}>
                        <Ionicons name="person-outline" size={16} color="#64748b" />
                    </View>
                    <View style={styles.namePhoneRow}>
                        <Text style={styles.customerName}>{item?.Name || "Customer"}</Text>
                        {item?.MobileNo ? (
                            <View style={styles.phoneTag}>
                                <Ionicons name="call-outline" size={12} color="#64748b" style={{ marginRight: 3 }} />
                                <Text style={styles.phoneText}>{item?.MobileNo}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Journey Date & Time */}
                {item?.StartDate ? (
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                        </View>
                        <View style={styles.dateMetaWrap}>
                            <Text style={styles.dateText}>{formatDateTime(item?.StartDate)}</Text>
                            <View style={styles.metaChipsRow}>
                                {item?.Hours ? (
                                    <View style={styles.metaChip}>
                                        <Text style={styles.metaChipText}>{Number(item.Hours)} Hours</Text>
                                    </View>
                                ) : null}
                                {item?.GearType ? (
                                    <View style={styles.metaChip}>
                                        <Text style={styles.metaChipText}>{item.GearType}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* Pickup Address */}
                {item?.Address ? (
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconWrap}>
                            <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                        </View>
                        <Text style={styles.addressText} numberOfLines={2}>
                            {item?.Address}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* OTP Banner (If Driver Assigned) */}
            {item?.OTP !== null && item?.OTP !== undefined && item?.OTP !== "" ? (
                <View style={styles.otpBanner}>
                    <View style={styles.otpLeft}>
                        <Ionicons name="key-outline" size={18} color="#047857" style={{ marginRight: 6 }} />
                        <Text style={styles.otpLabel}>TRIP START OTP:</Text>
                    </View>
                    <Text style={styles.otpValue}>{item?.OTP}</Text>
                </View>
            ) : null}

            {/* Action Buttons */}
            {item?.Status === "Created" || item?.Status === "Accepted" ? (
                <View style={styles.actionsRow}>
                    {item?.Status === "Created" ? (
                        <TouchableOpacity
                            onPress={showCancelAlert}
                            style={styles.cancelBtn}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close-circle-outline" size={16} color="#dc2626" style={{ marginRight: 4 }} />
                            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                        </TouchableOpacity>
                    ) : null}

                    {item?.Status === "Accepted" ? (
                        <TouchableOpacity
                            onPress={() => getDriverDetails(item?.Id)}
                            style={styles.driverBtn}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="person-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                            <Text style={styles.driverBtnText}>View Driver Details</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            ) : null}

            {/* Driver Details Modal */}
            <DriverInfoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                partnerDetails={partnerDetails}
            />
        </View>
    );
};

export default RenderBookingList;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    bookingIdWrap: {
        flexDirection: "row",
        alignItems: "center",
    },
    bookingIdText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
    },
    badgesRightRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    pillBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    pillBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    paidBadge: {
        backgroundColor: "#dcfce7",
    },
    paidBadgeText: {
        color: "#15803d",
    },
    unpaidBadge: {
        backgroundColor: "#fee2e2",
    },
    unpaidBadgeText: {
        color: "#b91c1c",
    },
    cardDivider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginBottom: 10,
    },
    detailsSection: {
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    infoIconWrap: {
        width: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        marginTop: 1,
    },
    namePhoneRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    customerName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
    },
    phoneTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    phoneText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
    },
    dateMetaWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    dateText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1e293b",
    },
    metaChipsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaChip: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    metaChipText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#475569",
    },
    addressText: {
        flex: 1,
        fontSize: 13,
        color: "#475569",
        lineHeight: 18,
    },
    otpBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ecfdf5",
        borderWidth: 1,
        borderColor: "#a7f3d0",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 10,
    },
    otpLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    otpLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: "#047857",
        letterSpacing: 0.5,
    },
    otpValue: {
        fontSize: 15,
        fontWeight: "900",
        color: "#065f46",
        letterSpacing: 1.5,
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        gap: 8,
    },
    cancelBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fee2e2",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    cancelBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#dc2626",
    },
    driverBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    driverBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#ffffff",
    },
});
