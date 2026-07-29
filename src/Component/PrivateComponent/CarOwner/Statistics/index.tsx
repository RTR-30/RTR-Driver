import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    ScrollView
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatisticService } from "./helper";
import { showError } from "../../../../Common/ToastMessage";
import Header from "../../../../Common/Header";
import { COLORS } from "../../../../utils/ColorCode";
import DatePickers from "../../../../Common/DatePicker";

const Statistics = () => {
    const value = "Statistics";

    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<any>(null);
    const [data, setData] = useState<any>({});

    const [startDate, setStartDate] = useState<any>();
    const [endDate, setEndDate] = useState<any>();

    const filterOption = [
        { key: 'All', value: 'all_time' },
        { key: 'Today', value: 'today' },
        { key: 'This Week', value: 'this_week' },
        { key: 'This Month', value: 'this_month' }
    ]

    const defaultValue = 'all_time'
    const [statisticsData, setStatisticsData] = useState<any>({
        filter: defaultValue,
        startDate: '',
        endDate: ''
    })

    const chooseFilter = async (selectFilter: any, values?: any, tokens?: any) => {
        if (selectFilter) {

            if (!statisticsData?.startDate || !statisticsData?.endDate) {
                console.log('toast called');
                return showError('Start Date & End Date are required');
            }

            const payload = await {
                startDate: statisticsData?.startDate,
                endDate: statisticsData?.endDate
            }
            setStatisticsData({
                ...statisticsData,
                filter: defaultValue,
            })
            fetchData(token, payload)

        } else {

            setStatisticsData({
                ...statisticsData,
                filter: values,
            })
            const payload = await {
                filter: values
            }
            fetchData(tokens, payload)
        }
    }

    const fetchData = async (tokens?: any, payload?: any) => {
        setLoading(true)
        try {
            const res = await StatisticService(tokens, payload)
            const { data: { success = false, data = {} } } = res
            console.log(
                JSON.stringify(res?.data)
            );

            if (success === true) {
                setData(data)
            } else {
                showError("Something went wrong")
            }

        } catch (error) {
            console.log(error);

            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const fetchUserData = async () => {
        try {
            const tokens: any = await AsyncStorage.getItem("token");
            if (tokens) {
                await setToken(tokens);
                chooseFilter(false, statisticsData?.filter, tokens)
            }
        } catch (error) {
            showError(error);
        }
    };

    useEffect(() => {
        fetchUserData()
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
                <View className="flex-1">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 13 }}
                    >
                        {filterOption.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() =>

                                    chooseFilter(false, item.value, token)
                                }
                                className={`mr-3 px-4 py-2 rounded-xl justify-center items-center w-28`}
                                style={{ backgroundColor: statisticsData.filter === item.value ? COLORS.primary : 'lightgray' }}
                            >
                                <Text
                                    className={`font-bold text-[14px] ${statisticsData.filter === item.value
                                        ? "text-white"
                                        : "text-black"
                                        }`}
                                >
                                    {item.key}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View className="p-2 w-full flex-row justify-around border-t-[0.5px] border-black">
                        <View className="w-[40%] h-11 bg-gray-300 p-2 justify-center items-center rounded-xl">
                            <DatePickers
                                value={startDate}
                                placeholder="Start Date"
                                maximumDate={endDate || new Date()}
                                onChange={(date) => {
                                    setStartDate(date);
                                    setStatisticsData((prev: any) => ({
                                        ...prev,
                                        startDate: formatDate(date),
                                    }));
                                }}
                            />
                        </View>

                        <View className="w-[40%] h-11 bg-gray-300 p-2 justify-center items-center rounded-xl">
                            <DatePickers
                                value={endDate}
                                placeholder="End Date"
                                minimumDate={startDate}
                                maximumDate={new Date()}
                                onChange={(date) => {
                                    setEndDate(date);
                                    setStatisticsData((prev: any) => ({
                                        ...prev,
                                        endDate: formatDate(date),
                                    }));
                                }}
                            />
                        </View>

                        <View className="w-[12%] h-11 bg-blue-600 p-2 justify-center items-center rounded-xl">
                            <TouchableOpacity onPress={() => chooseFilter(true)} className="h-full w-full justify-center items-center">
                                <Ionicons name="search" color={'white'} size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ flex: 5 }}>
                    <View className="p-2 flex-row mt-10 w-full justify-around bg-white">
                        <View className="p-2 w-[30%] h-28 border-[1px] border-black rounded-lg bg-white" style={{ elevation: 3, shadowColor: 'black' }}>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[18px] font-bold text-black text-center">Total Bookings</Text>
                            </View>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[20px] font-bold" style={{ color: COLORS.primary }}>{data?.totalBookings}</Text>
                            </View>
                        </View>

                        <View className="p-2 w-[30%] h-28 border-[1px] border-black rounded-lg bg-white" style={{ elevation: 3, shadowColor: 'black' }}>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[18px] font-bold text-black text-center">Completed Bookings</Text>
                            </View>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[20px] font-bold" style={{ color: COLORS.primary }}>{data?.completedBookings}</Text>
                            </View>
                        </View>
                        
                        <View className="p-2 w-[30%] h-28 border-[1px] border-black rounded-lg bg-white" style={{ elevation: 3, shadowColor: 'black' }}>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[18px] font-bold text-black text-center">Cancelled Bookings</Text>
                            </View>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[20px] font-bold" style={{ color: COLORS.primary }}>{data?.cancelledBookings}</Text>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
        </View>
    );
};

export default Statistics;