import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../../../utils/ColorCode";

const DriverInfoModal = ({ visible, onClose, partnerDetails }: any) => {
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback>
                        <View style={styles.card}>
                            {/* Modal Header */}
                            <View style={styles.headerRow}>
                                <View style={styles.driverAvatar}>
                                    <Ionicons name="person" size={26} color={COLORS.primary} />
                                </View>
                                <View style={styles.headerTextWrap}>
                                    <View style={styles.verifiedRow}>
                                        <Text style={styles.driverName}>
                                            {partnerDetails?.fullname || "Assigned Driver"}
                                        </Text>
                                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" style={{ marginLeft: 4 }} />
                                    </View>
                                    <Text style={styles.subText}>Verified RTR Driver Partner</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <Ionicons name="close" size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.divider} />

                            {/* Driver Details List */}
                            <View style={styles.infoList}>
                                {partnerDetails?.mobileno ? (
                                    <View style={styles.infoItem}>
                                        <View style={styles.itemIconWrap}>
                                            <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                                        </View>
                                        <View style={styles.itemContent}>
                                            <Text style={styles.itemLabel}>Mobile Number</Text>
                                            <Text style={styles.itemValue}>{partnerDetails?.mobileno}</Text>
                                        </View>
                                    </View>
                                ) : null}

                                {partnerDetails?.email ? (
                                    <View style={styles.infoItem}>
                                        <View style={styles.itemIconWrap}>
                                            <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
                                        </View>
                                        <View style={styles.itemContent}>
                                            <Text style={styles.itemLabel}>Email Address</Text>
                                            <Text style={styles.itemValue}>{partnerDetails?.email}</Text>
                                        </View>
                                    </View>
                                ) : null}

                                {partnerDetails?.licensenumber ? (
                                    <View style={styles.infoItem}>
                                        <View style={styles.itemIconWrap}>
                                            <Ionicons name="card-outline" size={16} color={COLORS.primary} />
                                        </View>
                                        <View style={styles.itemContent}>
                                            <Text style={styles.itemLabel}>Driving License</Text>
                                            <Text style={styles.itemValue}>{partnerDetails?.licensenumber}</Text>
                                        </View>
                                    </View>
                                ) : null}

                                {partnerDetails?.aadhaar ? (
                                    <View style={styles.infoItem}>
                                        <View style={styles.itemIconWrap}>
                                            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
                                        </View>
                                        <View style={styles.itemContent}>
                                            <Text style={styles.itemLabel}>Aadhaar Verified</Text>
                                            <Text style={styles.itemValue}>{partnerDetails?.aadhaar}</Text>
                                        </View>
                                    </View>
                                ) : null}
                            </View>

                            {/* Bottom Done Button */}
                            <TouchableOpacity onPress={onClose} style={styles.doneBtn} activeOpacity={0.85}>
                                <Text style={styles.doneBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default DriverInfoModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 12,
    },
    driverAvatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    headerTextWrap: {
        flex: 1,
    },
    verifiedRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    driverName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
    },
    subText: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 1,
    },
    closeBtn: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginBottom: 12,
    },
    infoList: {
        gap: 10,
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 10,
        padding: 10,
    },
    itemIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    itemContent: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#64748b",
        letterSpacing: 0.3,
    },
    itemValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0f172a",
        marginTop: 1,
    },
    doneBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    doneBtnText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
    },
});
