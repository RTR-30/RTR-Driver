import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const RenderBookingList = ({ item }: any) => {
    const formatDateTime = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "";
        const parsedDate = new Date(dateTime);
        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            ...(includeTime && {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
        });
    };

    return (
        <View
            style={{
                padding: 16,
                backgroundColor: "white",
                borderRadius: 12,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            }}
        >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
                <View
                    style={{
                        backgroundColor: "#fff",
                        width: 60,
                        height: 60,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 30,
                        elevation: 5,
                        borderWidth: 0.5,
                    }}
                >
                    <FontAwesome6 name="car" size={24} color="black" />
                </View>
            </View>

            <Text
                style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 8,
                }}
            >
                {item.name}
            </Text>

            <Text
                style={{
                    fontSize: 14,
                    color: "gray",
                    textAlign: "center",
                    marginBottom: 8,
                }}
            >
                {item.address}
            </Text>

            <Text
                style={{
                    fontSize: 14,
                    color: "gray",
                    textAlign: "center",
                    marginBottom: 16,
                }}
            >
                {item.mobileNumber}
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <View>
                    <Text style={{ fontSize: 12, color: "blue" }}>Start Date</Text>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                        {formatDateTime(item.startDate)}
                    </Text>
                </View>
                {item.endDate && (
                    <View>
                        <Text style={{ fontSize: 12, color: "blue" }}>End Date</Text>
                        <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                            {formatDateTime(item.endDate)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        marginRight: 8,
                        backgroundColor: "#f0f0f0",
                        borderRadius: 6,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>
                        Booking Again
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        marginLeft: 8,
                        backgroundColor: "#fff3e0",
                        borderRadius: 6,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "orange" }}>
                        Processing
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RenderBookingList;
