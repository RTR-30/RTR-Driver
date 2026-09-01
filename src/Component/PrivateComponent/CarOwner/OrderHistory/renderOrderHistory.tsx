import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { showError } from "../../../../Common/ToastMessage";
import { BookingFeedbackService } from "./helper";
import { COLORS } from "../../../../utils/ColorCode";
import Feedback from "../../../../Common/Feedback";

const RenderOrderHistory = ({ item, setShowLoading, handleData, setCurrentPageLimit }: any) => {
    const [selectedBookingId, setSelectedBookingId] = useState<any>();
    const [showFeedback, setShowFeedback] = useState<boolean>(false);

    const openFeedbackModal = (bookingid: any) => {
        setSelectedBookingId(bookingid)
        setShowFeedback(true);
    }

    const closeFeedbackModal = () => {
        setCurrentPageLimit(10)
        handleData(10, 1)
        setShowFeedback(false);
    }
    return (
        <View className="flex-1">
            <View className="p-3 rounded-t-[10px] border-[0.5px] border-black shadow-black" style={{ elevation: 2 }}>
                <View className="w-full flex-row">
                    <View className="w-[100%] ml-2">
                        <View className={`w-[30%] self-end absolute ${item.Status === "Closed" ? "bg-gray-600" : "bg-red-600"} rounded-[5px]`}>
                            <Text className="text-[12px] text-white text-center font-bold">{item.Status}</Text>
                        </View>

                        <View className="flex-row w-full mt-1">
                            <Ionicons name="person" size={18} color={"orange"} />
                            <Text className="left-2 font-semibold">{item.Name}</Text>
                        </View>

                        <View className="flex-row w-full mt-1">
                            <Ionicons name="location" size={18} color={"orange"} />
                            <Text className="left-2 font-semibold">{item.Address}</Text>
                        </View>

                        <View className="w-full flex-row">
                            <View className="w-[70%]">
                                <View className="flex-row w-full mt-1">
                                    <Ionicons name="time" size={18} color={"orange"} />
                                    <Text className="left-2 font-semibold text-black">Hours :  {item.Hours} hours</Text>
                                </View>

                                <View className="flex-row w-full mt-1">
                                    <Ionicons name="cash" size={18} color={"orange"} />
                                    <Text className="left-2 font-semibold text-black">FinalAmount : {item.FinalAmount ? "₹" + item.FinalAmount : "-"}</Text>
                                </View>
                            </View>

                            {item?.Status === "Closed" &&
                                <>
                                    {item?.feedbackGiven === false && item?.isFeedbackExpired === false ?
                                        <View className="w-[30%]">
                                            <View className="flex-row w-full mt-2 justify-center items-center">
                                                <TouchableOpacity onPress={() => openFeedbackModal(item?.Id)} style={{ backgroundColor: COLORS.primary }} className="justify-center items-center p-2 rounded-md">
                                                    <Text className="font-bold text-white text-[12px]">Feedback</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View> : <View className="w-[30%]">
                                            <View className="flex-row w-full mt-2 justify-center items-center">
                                                <Text className="font-bold text-center text-[#4F200D] text-[12px]">Feedback Completed</Text>
                                            </View>
                                        </View>
                                    }
                                </>
                            }
                        </View>

                    </View>
                </View>
            </View>

            {showFeedback ?
                <Feedback
                    visible={showFeedback}
                    onClose={() => closeFeedbackModal()}
                    bookingdata={selectedBookingId}
                /> : null
            }
        </View>
    );
};

export default RenderOrderHistory;
