import React, { useEffect, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../../../utils/ColorCode";

export type MoreProps = {
    hours: any;
    TripDetails: any;
    setIsVisible: (visible: boolean) => void;
    isVisible: boolean;
    setEstimateAmount?: any;
    handleBooking: () => void;
};

const ModalBooking = ({
    hours,
    setIsVisible,
    isVisible,
    setEstimateAmount,
    handleBooking,
    TripDetails,
}: MoreProps) => {
    const descriptionList = useMemo(() => {
        try {
            if (typeof TripDetails?.trip_type_description === "string") {
                return JSON.parse(TripDetails.trip_type_description);
            }
            if (Array.isArray(TripDetails?.trip_type_description)) {
                return TripDetails.trip_type_description;
            }
        } catch (error) {
            console.warn("Error parsing trip_type_description:", error);
        }
        return [];
    }, [TripDetails?.trip_type_description]);

    const totalAmount = Number(TripDetails?.total_amount) || 0;
    const taxRate = (Number(TripDetails?.tax) || 0) / 100;
    const GST = Math.round(totalAmount * taxRate);

    const platformFeeRate = (Number(TripDetails?.platform_fee) || 0) / 100;
    const PlatformFee = Math.round(totalAmount * platformFeeRate);

    const driverCharge = Number(TripDetails?.driver_charge) || 0;
    const EstimatedAmount = driverCharge + GST + PlatformFee;
    const totalDiscount = totalAmount > EstimatedAmount ? totalAmount - EstimatedAmount : 0;

    useEffect(() => {
        if (setEstimateAmount && !isNaN(EstimatedAmount)) {
            setEstimateAmount(EstimatedAmount);
        }
    }, [EstimatedAmount, setEstimateAmount]);

    return (
        <Modal
            transparent
            animationType="slide"
            visible={isVisible}
            onRequestClose={() => setIsVisible(false)}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
                <View className="flex-1 justify-end bg-black/60">
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View className="bg-white rounded-t-[32px] pt-3 pb-8 px-5 w-full shadow-2xl">
                            {/* Drag Indicator Handle */}
                            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-3" />

                            {/* Header Row */}
                            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                <View className="flex-1 mr-2">
                                    <Text className="text-[19px] font-black text-slate-900 tracking-tight">
                                        Trip Fare Breakdown
                                    </Text>
                                    <Text className="text-[12px] font-medium text-slate-500 mt-0.5">
                                        Review your fare details before confirming
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setIsVisible(false)}
                                    className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={18} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                                style={{ maxHeight: Dimensions.get("window").height * 0.65 }}
                            >
                                {/* Trip Overview Highlight Badge */}
                                <View className="flex-row items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-3">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 items-center justify-center mr-3">
                                            <Ionicons name="time" size={20} color={COLORS.primary} />
                                        </View>
                                        <View>
                                            <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                                Selected Duration
                                            </Text>
                                            <Text className="text-[15px] font-black text-slate-900">
                                                {hours ? `${hours} Hours Trip` : "Custom Trip"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                                        <Text className="text-[11px] font-bold text-[#E0211F]">
                                            Dedicated Driver
                                        </Text>
                                    </View>
                                </View>

                                {/* Itemized Fare Card */}
                                <View className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 mb-3">
                                    <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                                        Fare Breakdown
                                    </Text>

                                    {/* Driver Charge */}
                                    <View className="flex-row items-center justify-between py-1.5">
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="person-outline"
                                                size={15}
                                                color="#64748b"
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text className="text-[13px] font-semibold text-slate-700">
                                                Driver Charge
                                            </Text>
                                        </View>
                                        <Text className="text-[14px] font-bold text-slate-900">
                                            ₹{driverCharge}
                                        </Text>
                                    </View>

                                    {/* Platform Fee */}
                                    <View className="flex-row items-center justify-between py-1.5">
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="hardware-chip-outline"
                                                size={15}
                                                color="#64748b"
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text className="text-[13px] font-semibold text-slate-700">
                                                Platform Fee
                                                {TripDetails?.platform_fee ? ` (${TripDetails.platform_fee}%)` : ""}
                                            </Text>
                                        </View>
                                        <Text className="text-[14px] font-bold text-slate-900">
                                            ₹{PlatformFee}
                                        </Text>
                                    </View>

                                    {/* Taxes & GST */}
                                    <View className="flex-row items-center justify-between py-1.5">
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="receipt-outline"
                                                size={15}
                                                color="#64748b"
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text className="text-[13px] font-semibold text-slate-700">
                                                Taxes & GST
                                                {TripDetails?.tax ? ` (${TripDetails.tax}%)` : ""}
                                            </Text>
                                        </View>
                                        <Text className="text-[14px] font-bold text-slate-900">
                                            ₹{GST}
                                        </Text>
                                    </View>

                                    {/* RTR Discount if any */}
                                    {totalDiscount > 0 && (
                                        <View className="flex-row items-center justify-between py-1.5">
                                            <View className="flex-row items-center">
                                                <Ionicons
                                                    name="pricetag-outline"
                                                    size={15}
                                                    color="#15803d"
                                                    style={{ marginRight: 8 }}
                                                />
                                                <Text className="text-[13px] font-bold text-emerald-700">
                                                    RTR Discount
                                                </Text>
                                            </View>
                                            <Text className="text-[14px] font-extrabold text-emerald-700">
                                                -₹{totalDiscount}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Dashed Separator */}
                                    <View className="border-t border-dashed border-slate-300 my-2.5" />

                                    {/* Total Estimated Fare */}
                                    <View className="flex-row items-center justify-between pt-1">
                                        <View>
                                            <Text className="text-[14px] font-black text-slate-900">
                                                Estimated RTR Fare
                                            </Text>
                                            <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
                                                Inclusive of all taxes
                                            </Text>
                                        </View>

                                        <View className="items-end">
                                            {totalDiscount > 0 && (
                                                <Text className="text-[12px] font-semibold text-slate-400 line-through">
                                                    ₹{totalAmount}
                                                </Text>
                                            )}
                                            <Text className="text-[22px] font-black text-[#E0211F]">
                                                ₹{EstimatedAmount}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Trip Features & Inclusions Details (Full View, No Horizontal Scroll) */}
                                {descriptionList && descriptionList.length > 0 && (
                                    <View className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 mb-3">
                                        <View className="flex-row items-center justify-between mb-3">
                                            <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                                Trip Features & Inclusions
                                            </Text>
                                            <View className="bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                                <Text className="text-[10px] font-bold text-emerald-700">
                                                    {descriptionList.length} Details
                                                </Text>
                                            </View>
                                        </View>

                                        <View>
                                            {descriptionList.map((item: any, index: number) => {
                                                const label = item?.value || (typeof item === "string" ? item : "");
                                                if (!label) return null;

                                                const isLast = index === descriptionList.length - 1;

                                                return (
                                                    <View
                                                        key={index}
                                                        className={`flex-row items-start ${
                                                            !isLast ? "mb-2.5 pb-2.5 border-b border-slate-200/60" : ""
                                                        }`}
                                                    >
                                                        <View className="w-5 h-5 rounded-full bg-emerald-100 items-center justify-center mr-2.5 mt-0.5">
                                                            <Ionicons name="checkmark" size={13} color="#15803d" />
                                                        </View>
                                                        <Text className="text-[13px] font-medium text-slate-700 flex-1 leading-5">
                                                            {label}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}

                                {/* Trust & Guarantee Pill */}
                                <View className="flex-row items-center bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-2.5 mb-5">
                                    <Ionicons name="shield-checkmark" size={17} color="#15803d" />
                                    <Text className="text-[12px] font-semibold text-emerald-800 ml-2.5 flex-1">
                                        No advance payment required. Pay directly after trip completion.
                                    </Text>
                                </View>
                            </ScrollView>

                            {/* Confirm Booking CTA */}
                            <TouchableOpacity
                                onPress={handleBooking}
                                className="w-full h-13 bg-[#E0211F] rounded-2xl flex-row items-center justify-center shadow-md active:opacity-90 p-2"
                                style={{ elevation: 3 }}
                            >
                                <Ionicons
                                    name="checkmark-done"
                                    size={20}
                                    color="#ffffff"
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-white text-[16px] font-black tracking-wide">
                                    Confirm Booking
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ModalBooking;
