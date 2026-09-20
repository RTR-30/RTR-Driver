import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ToastAndroid } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import RazorpayCheckout from "react-native-razorpay";
import { createOrder, verifyPayments } from "./helper";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";

export type MoreProps = {
    hours: any;
    TripDetails: any;
    setIsVisible: (visible: boolean) => void;
    isVisible: boolean;
    setEstimateAmount?: any;
    handleBooking: () => void;
};

const ModalBooking = ({ hours, setIsVisible, isVisible, setEstimateAmount, handleBooking, TripDetails }: MoreProps) => {

    const descriptionList = TripDetails?.trip_type_description
        ? JSON.parse(TripDetails.trip_type_description)
        : [];

    const tax = TripDetails?.tax / 100;
    const GST = Math.round(TripDetails?.total_amount * tax);

    const appFees = TripDetails?.platform_fee / 100;
    const PlatformFee = Math.round(TripDetails?.total_amount * appFees);

    const EstimatedAmount = Number(TripDetails?.driver_charge) + Number(GST) + Number(PlatformFee)
    const totalDiscount = TripDetails?.total_amount - EstimatedAmount

    const withoutPayment = () => {
        handleBooking();
    }

    useEffect(() => {
        setEstimateAmount(EstimatedAmount)
    }, [EstimatedAmount])

    return (
        <Modal
            transparent
            animationType="slide"
            visible={isVisible}
            onRequestClose={() => setIsVisible(false)}
        >
            <View style={{ backgroundColor: "rgba(0,0,0,0.5)" }} className="flex-1 justify-center items-center">
                <View className="w-[95%] rounded-20 p-1 bg-white rounded-10">
                    <View className="flex-row justify-between items-center w-full" style={{ backgroundColor: COLORS.primary }}>
                        <Text className="text-[18px] font-bold text-white left-[10%]">Trip Fair</Text>
                        <TouchableOpacity onPress={() => setIsVisible(false)} className="w-[20%] self-end" style={{ paddingVertical: 10, paddingHorizontal: 20 }}>
                            {/* <Text style={styles.closeText}>Close</Text> */}
                            <Ionicons name="close" size={20} color={"white"} style={{ alignSelf: 'flex-end' }} />
                        </TouchableOpacity>
                    </View>

                    <View className="w-full justify-center items-center flex-row">
                        <Text className="text-[18px] font-extrabold text-black text-center">
                            {hours} hours trip
                        </Text>
                    </View>

                    <View className="bg-white w-full p-[10px] flex-row border-b-[0.5px]">
                        <View className="w-[50%]">
                            <Text className="text-[18px] font-bold">Total Amount</Text>
                        </View>

                        <View className="w-[50%]">
                            <Text className="text-[18px] font-bold">: ₹{TripDetails?.total_amount}</Text>
                        </View>
                    </View>

                    <View className="bg-white w-full p-[10px] flex-row">
                        <View className="w-[50%]">
                            <Text className="text-[18px] font-normal">Driver Charge</Text>
                            <Text className="text-[18px] font-normal">GST+</Text>
                            <Text className="text-[18px] font-normal">Platform Fee</Text>
                            <Text className="text-[18px] font-normal text-red-400">RTR Discount-</Text>
                        </View>

                        <View className="w-[50%]">
                            <Text className="text-[18px] font-normal">: ₹{TripDetails?.driver_charge}</Text>
                            <Text className="text-[18px] font-normal">: ₹{GST}</Text>
                            <Text className="text-[18px] font-normal">: ₹{PlatformFee}</Text>
                            <Text className="text-[18px] font-normal text-red-400">: ₹{totalDiscount}</Text>
                        </View>
                    </View>

                    <View className="bg-white w-full p-[10px] flex-row border-t-[0.5px]">
                        <View className="w-[50%]">
                            <Text className="text-[18px] font-bold">Estimated RTR Fare</Text>
                        </View>

                        <View className="w-[50%]">
                            <Text className="text-[18px] font-bold">: ₹ {EstimatedAmount}</Text>
                        </View>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        <View className="flex-row p-2 bg-[#f3f4f7] rounded-[10px]">

                            {descriptionList.map((item: any, index: number) => (
                                <View
                                    key={index}
                                    className="bg-white px-3 py-1 rounded-[8px] mr-2"
                                >
                                    <Text className="text-black text-[14px] font-serif">
                                        {item.value}
                                    </Text>
                                </View>
                            ))}

                        </View>
                    </ScrollView>


                    <View className="w-[50%] h-10 mt-6 mb-10 self-center rounded-[10px]" style={{ backgroundColor: COLORS.primary }}>
                        <TouchableOpacity onPress={() => withoutPayment()} className="rounded-[10px] w-full h-full justify-center items-center">
                            <Text className="text-center text-[18px] text-white font-bold">Confirm Booking</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    amountText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
});

export default ModalBooking;
