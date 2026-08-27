import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert, ToastAndroid } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getDriverinfoService, UpdateBooking } from "./helper";
import DriverInfoModal from "./DriverInfoModal";
import { showError, showSuccess } from "../../../../Common/ToastMessage";

const RenderBookingList = ({ item, token, handleData }: any) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [partnerDetails, setPartnerDetails] = useState(null);
    
    const getDriverDetails = async (bookingId: any) => {
        try {
            const res = await getDriverinfoService(token, bookingId);
            if (res?.data?.success === true) {
                const { partnerDetails } = res?.data;
                setPartnerDetails(partnerDetails);
                setModalVisible(true)
            }
        } catch (error: any) {
            showError(error);
        }
    }

    const updateBooklist = async () => {
        const data = {
            bookingId: item.Id
        }

        try {
            const res = await UpdateBooking(token, data)
            showSuccess(res?.data.message);
            handleData(token);
        } catch (error: any) {
            showError(error);
        }
    }

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
                hour12: true,
            }),
        });
    };

    const EndDateFormate = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "";
        const parsedDate = new Date(dateTime);
        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const showCancelAlert = () => {
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this booking?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => updateBooklist() }
            ]
        );
    };


    return (
        <View className="flex-1">
            <View className={`w-[40%] rounded-tl-[10px] rounded-tr-[50%] border-t-[1px] border-l-[1px] border-r-[1px] border-black justify-center items-center ${item.Status === "Created" ? "bg-green-600" : item.Status === "Accepted" ? "bg-blue-600" : "bg-red-600"}`}>
                <Text className="text-center text-[18px] text-white font-semibold">{item?.Status}</Text>
            </View>

            <View className="p-3 rounded-b-[10px] border-[0.5px] border-black shadow-black" style={{ elevation: 2 }}>
                <View className="w-full flex-row">
                    <View className="w-[100%] ml-2">
                        <Text className={`absolute self-end right-1 text-[12px] font-bold ${item.PaymentStatus === "Paid" ? "text-green-600" : "text-red-600"}`}>{item.PaymentStatus}</Text>
                        <View className="flex-row w-full mt-1">
                            <Ionicons name="person" size={18} color={"#00bce4"} />
                            <Text className="left-2 text-black font-semibold">{item.Name}</Text>
                        </View>

                        <View className="flex-row w-full mt-1">
                            <Ionicons name="location" size={18} color={"#00bce4"} />
                            <Text className="left-2 text-black font-semibold">{item.Address}</Text>
                        </View>

                        <View className="flex-row w-full mt-1">
                            <View className="flex-row w-[50%] items-center">
                                <Ionicons name="call" size={18} color={"#00bce4"} />
                                <Text className="left-2 text-black font-semibold">{item.MobileNo}</Text>
                            </View>

                        </View>

                        <View className="flex-row w-full mt-2">
                            <View className="flex-row w-[100%] items-center">
                                <Ionicons name="calendar" size={18} color={"#00bce4"} />
                                <Text className="left-2 text-black font-semibold">Start Data : {formatDateTime(item.StartDate)}</Text>
                            </View>
                        </View>

                        <View className="flex-row w-[80%] self-center mt-2 p-2 rounded-[10%] justify-center items-center bg-green-700">
                            <Text className="text-white font-semibold">OTP</Text>
                            <Text className="text-white font-semibold">: {item?.OTP !== null ? item?.OTP : "Driver Not Accept"}</Text>
                        </View>
                    </View>
                </View>


                <View className="flex-row mt-3 w-full justify-around items-center">

                    { item.Status === "Created" ?
                        <TouchableOpacity onPress={showCancelAlert} className="flex-row w-[40%] h-6 justify-center items-center bg-red-600 rounded-[10px]">
                            <Text className="text-white text-[14px] ml-2 font-bold">Cancel Booking</Text>
                        </TouchableOpacity> : null
                    }

                    {
                        item.Status === "Accepted" ? (
                            <TouchableOpacity onPress={() => getDriverDetails(item?.Id)} className="flex-row w-[40%] h-6 justify-center items-center bg-orange-400 rounded-[10px]">
                                <Ionicons name="car" size={18} color={"white"} />
                                <Text className="text-white text-[14px] ml-2 font-bold">Driver Details</Text>
                            </TouchableOpacity>
                        ) : null
                    }
                </View>
            </View>

            <DriverInfoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                partnerDetails={partnerDetails}
            />
        </View>
    );
};

export default RenderBookingList;
