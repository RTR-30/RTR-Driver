import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../../../utils/ColorCode";
import Feedback from "../../../../Common/Feedback";

interface RenderOrderHistoryProps {
    item: any;
    setShowLoading: (val: boolean) => void;
    handleData: (limit: number, page: number) => Promise<void>;
    setCurrentPageLimit: (limit: number | ((prev: number) => number)) => void;
}

const RenderOrderHistory: React.FC<RenderOrderHistoryProps> = ({
    item,
    setShowLoading,
    handleData,
    setCurrentPageLimit,
}) => {
    const [selectedBookingId, setSelectedBookingId] = useState<any>(null);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);

    const openFeedbackModal = (bookingId: any) => {
        setSelectedBookingId(bookingId);
        setShowFeedback(true);
    };

    const closeFeedbackModal = () => {
        setShowFeedback(false);
        setCurrentPageLimit(10);
        handleData(10, 1);
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

    const isClosed = item?.Status === "Closed" || item?.Status === "Completed";
    const isCancelled = item?.Status === "Cancelled" || item?.Status === "Rejected";
    const isPaid = item?.PaymentStatus?.toLowerCase() === "paid";

    return (
        <View className="bg-white rounded-2xl p-3.5 border border-slate-100" style={{ elevation: 2 }}>
            {/* Top Bar: Booking ID & Badges */}
            <View className="flex-row items-center justify-between mb-2.5">
                <View className="flex-row items-center">
                    <View className="w-[22px] h-[22px] rounded-full bg-red-100 justify-center items-center mr-1.5">
                        <Ionicons name="receipt-outline" size={13} color={COLORS.primary} />
                    </View>
                    <Text className="text-[13px] font-bold text-slate-800">Booking #{item?.Id}</Text>
                </View>

                <View className="flex-row items-center">
                    {/* Payment Status Pill */}
                    {item?.PaymentStatus ? (
                        <View className={`flex-row items-center px-2 py-0.5 rounded-md ${isPaid ? "bg-emerald-100" : "bg-red-100"}`}>
                            <Text className={`text-[11px] font-bold ${isPaid ? "text-emerald-700" : "text-red-700"}`}>
                                {item?.PaymentStatus}
                            </Text>
                        </View>
                    ) : null}

                    {/* Trip Status Pill */}
                    <View
                        className={`flex-row items-center px-2 py-0.5 rounded-md ml-1.5 ${
                            isClosed
                                ? "bg-emerald-100"
                                : isCancelled
                                ? "bg-red-100"
                                : "bg-slate-100"
                        }`}
                    >
                        <Ionicons
                            name={
                                isClosed
                                    ? "checkmark-done-circle-outline"
                                    : isCancelled
                                    ? "close-circle-outline"
                                    : "information-circle-outline"
                            }
                            size={13}
                            color={isClosed ? "#15803d" : isCancelled ? "#b91c1c" : "#475569"}
                            style={{ marginRight: 3 }}
                        />
                        <Text
                            className={`text-[11px] font-bold ${
                                isClosed
                                    ? "text-emerald-700"
                                    : isCancelled
                                    ? "text-red-700"
                                    : "text-slate-600"
                            }`}
                        >
                            {isClosed ? "Completed" : isCancelled ? "Cancelled" : item?.Status || "Updated"}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="h-[1px] bg-slate-100 mb-2.5" />

            {/* Journey Details */}
            <View className="gap-2">
                {/* Date & Time */}
                {item?.StartDate ? (
                    <View className="flex-row items-start">
                        <View className="w-[22px] justify-center items-center mr-2 mt-0.5">
                            <Ionicons name="calendar-outline" size={15} color="#64748b" />
                        </View>
                        <Text className="flex-1 text-[13px] font-semibold text-slate-800">
                            {formatDateTime(item?.StartDate)}
                        </Text>
                    </View>
                ) : null}

                {/* Pickup Address */}
                {item?.Address ? (
                    <View className="flex-row items-start">
                        <View className="w-[22px] justify-center items-center mr-2 mt-0.5">
                            <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                        </View>
                        <Text className="flex-1 text-[13px] text-slate-600 leading-[18px]" numberOfLines={2}>
                            {item?.Address}
                        </Text>
                    </View>
                ) : null}

                {/* Metadata Chips: Name, Hours, Gear */}
                <View className="flex-row flex-wrap items-center gap-1.5 mt-0.5">
                    {item?.Name ? (
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                            <Ionicons name="person-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
                            <Text className="text-[11px] font-semibold text-slate-600" numberOfLines={1}>
                                {item?.Name}
                            </Text>
                        </View>
                    ) : null}

                    {item?.Hours ? (
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                            <Ionicons name="time-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
                            <Text className="text-[11px] font-semibold text-slate-600">
                                {Number(item?.Hours)} {Number(item?.Hours) === 1 ? "Hour" : "Hours"}
                            </Text>
                        </View>
                    ) : null}

                    {item?.GearType ? (
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                            <Ionicons name="car-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
                            <Text className="text-[11px] font-semibold text-slate-600">{item?.GearType}</Text>
                        </View>
                    ) : null}
                </View>
            </View>

            {/* Bottom Card Footer: Fare & Action */}
            <View className="flex-row items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 mt-3 border border-slate-100">
                <View className="justify-center">
                    <Text className="text-[10px] font-extrabold text-slate-500 tracking-wider">FINAL AMOUNT</Text>
                    <Text className="text-[17px] font-extrabold text-slate-900 mt-0.5">
                        {item?.FinalAmount ? `₹${item.FinalAmount}` : item?.Amount ? `₹${item.Amount}` : "—"}
                    </Text>
                </View>

                {/* Action: Feedback button or status */}
                <View className="flex-row items-center">
                    {isClosed && (
                        <>
                            {item?.feedbackGiven === false && item?.isFeedbackExpired === false ? (
                                <TouchableOpacity
                                    onPress={() => openFeedbackModal(item?.Id)}
                                    className="flex-row items-center justify-center bg-[#E0211F] py-1.5 px-3 rounded-lg shadow-sm"
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="star" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                                    <Text className="text-[12px] font-bold text-white">Rate Trip</Text>
                                </TouchableOpacity>
                            ) : item?.feedbackGiven === true ? (
                                <View className="flex-row items-center bg-amber-50 py-1 px-2.5 rounded-md border border-amber-200">
                                    <Ionicons name="star" size={13} color="#f59e0b" style={{ marginRight: 4 }} />
                                    <Text className="text-[11px] font-bold text-amber-700">Feedback Submitted</Text>
                                </View>
                            ) : null}
                        </>
                    )}

                    {isCancelled && (
                        <View className="flex-row items-center bg-red-100 py-1 px-2 rounded-md">
                            <Ionicons name="alert-circle-outline" size={13} color="#b91c1c" style={{ marginRight: 4 }} />
                            <Text className="text-[11px] font-bold text-red-700">Order Cancelled</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Feedback Modal */}
            {showFeedback && (
                <Feedback
                    visible={showFeedback}
                    onClose={closeFeedbackModal}
                    bookingdata={selectedBookingId}
                />
            )}
        </View>
    );
};

export default RenderOrderHistory;
