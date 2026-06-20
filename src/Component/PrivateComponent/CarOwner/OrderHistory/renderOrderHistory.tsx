import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const RenderOrderHistory = ({ item, setShowLoading }: any) => {
    const [openField, setOpenField] = useState<boolean>(false);

    const handleField = () => {
        setOpenField(!openField);
        setShowLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            setOpenField(false);
        }, [])
    );

    return (
        <View className="flex-1">
            <View className="p-3 rounded-t-[10px] border-[0.5px] border-black shadow-black" style={{ elevation: 2 }}>
                <View className="w-full flex-row">
                    <View className="w-[100%] ml-2">
                        <View className={`w-[30%] self-end absolute ${item.Status === "Closed" ? "bg-gray-600" : "bg-red-600"} rounded-[5px]`}>
                            <Text className="text-[12px] text-white text-center font-bold">{item.Status}</Text>
                        </View>
                        {/* <Text className={`absolute self-end right-1 text-[12px] font-bold ${item.PaymentStatus === "Paid" ? "text-green-600" : "text-red-600"}`}>{item.PaymentStatus}</Text> */}
                        <View className="flex-row w-full mt-1">
                            <Ionicons name="person" size={18} color={"orange"} />
                            <Text className="left-2 font-semibold">{item.Name}</Text>
                        </View>

                        <View className="flex-row w-full mt-1">
                            <Ionicons name="location" size={18} color={"orange"} />
                            <Text className="left-2 font-semibold">{item.Address}</Text>
                        </View>

                        {
                            openField && (
                                <View className="flex-row">
                                    <View className="w-[70%]">
                                        <View className="flex-row w-full mt-1">
                                            <Text className="left-2 font-semibold text-black">GearType :  {item.GearType}</Text>
                                        </View>

                                        <View className="flex-row w-full mt-1">
                                            <Text className="left-2 font-semibold text-black">Hours :  {item.Hours} hours</Text>
                                        </View>

                                        <View className="flex-row w-full mt-1">
                                            <Text className="left-2 font-semibold text-black">EstimateAmount :  ₹{item.EstimateAmount}</Text>
                                        </View>
                                    </View>

                                    {/* <View className="w-[30%] justify-center items-center">
                                        <TouchableOpacity className="w-full bg-[#5a639c] h-10 justify-center items-center rounded-[5px]">
                                            <Text className="text-[12px] text-white text-center font-bold">Book Again</Text>
                                        </TouchableOpacity>
                                    </View> */}
                                </View>
                            )
                        }


                    </View>
                </View>
            </View>
            <View className="w-full justify-center items-center">
                <TouchableOpacity onPress={handleField} className="w-full justify-center bg-orange-500 items-center rounded-b-[10px] border-[0.5px]">
                    <Ionicons name="chevron-down" color={"white"} size={20} className="self-center" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RenderOrderHistory;
