import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { StatisticService } from "./helper";
import { showError } from "../../../../Common/ToastMessage";
import Header from "../../../../Common/Header";
import { COLORS } from "../../../../utils/ColorCode";
import DatePickers from "../../../../Common/DatePicker";
import Loader from "../../../../Common/Loader";

const Statistics = () => {
    const value = "Statistics";

    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<any>({});
    const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);

    const [startDate, setStartDate] = useState<any>();
    const [endDate, setEndDate] = useState<any>();

    const filterOption = [
        { key: "All", value: "all_time" },
        { key: "Today", value: "today" },
        { key: "This Week", value: "this_week" },
        { key: "This Month", value: "this_month" },
    ];

    const defaultValue = "all_time";
    const [statisticsData, setStatisticsData] = useState<any>({
        filter: defaultValue,
        startDate: "",
        endDate: "",
    });

    const chooseFilter = async (selectFilter: boolean, values?: any) => {
        if (selectFilter) {
            if (!statisticsData?.startDate || !statisticsData?.endDate) {
                return showError("Start Date & End Date are required");
            }

            const payload = {
                filter: "",
                startDate: statisticsData?.startDate || "",
                endDate: statisticsData?.endDate || "",
            };

            setStatisticsData((prev: any) => ({
                ...prev,
                filter: defaultValue,
            }));

            setIsFilterApplied(true);
            fetchData(payload);
        } else {
            setStatisticsData({
                filter: values || "",
                startDate: "",
                endDate: "",
            });
            setStartDate(undefined);
            setEndDate(undefined);

            const payload = {
                filter: values || "",
                startDate: "",
                endDate: "",
            };

            if (values === "all_time") {
                setIsFilterApplied(false);
            } else {
                setIsFilterApplied(true);
            }
            fetchData(payload);
        }
    };

    const fetchData = async (payload?: any) => {
        setLoading(true);
        try {
            const formattedPayload = {
                filter: payload?.filter || "",
                startDate: payload?.startDate || "",
                endDate: payload?.endDate || "",
            };
            const res = await StatisticService(formattedPayload);
            const { data: { success = false, data = {} } } = res;

            if (success === true) {
                setData(data);
            } else {
                showError("Something went wrong");
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilter = () => {
        setStartDate(undefined);
        setEndDate(undefined);

        setStatisticsData({
            filter: "all_time",
            startDate: "",
            endDate: "",
        });
        setIsFilterApplied(false);

        fetchData({
            filter: "all_time",
            startDate: "",
            endDate: "",
        });
    };

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    useEffect(() => {
        chooseFilter(false, statisticsData?.filter);
    }, []);

    const total = Number(data?.totalBookings) || 0;
    const completed = Number(data?.completedBookings) || 0;
    const cancelled = Number(data?.cancelledBookings) || 0;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    const getActiveFilterLabel = () => {
        if (startDate && endDate) {
            return `${formatDate(startDate)} to ${formatDate(endDate)}`;
        }
        const current = filterOption.find((opt) => opt.value === statisticsData.filter);
        return current ? current.key : "All Time";
    };

    return (
        <View className="flex-1 bg-[#E0211F]">
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {loading && <Loader />}

            {/* Screen Header */}
            <View className="h-[60px] justify-center items-center bg-[#E0211F]">
                <Header value={value} />
            </View>

            {/* Main Content Sheet */}
            <View className="flex-1 bg-slate-50 rounded-t-[28px] overflow-hidden">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Time Period Filter Pills */}
                    <View className="mb-4">
                        <Text className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                            Time Period
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {filterOption.map((item, index) => {
                                const isSelected = statisticsData.filter === item.value && !startDate;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => chooseFilter(false, item.value)}
                                        className={`mr-2.5 px-4 py-2 rounded-full border ${isSelected
                                                ? "bg-[#E0211F] border-[#E0211F]"
                                                : "bg-white border-slate-200"
                                            }`}
                                        style={{ elevation: isSelected ? 2 : 0 }}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            className={`font-bold text-[13px] ${isSelected ? "text-white" : "text-slate-600"
                                                }`}
                                        >
                                            {item.key}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Custom Date Range Filter Card */}
                    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-5" style={{ elevation: 2 }}>
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <View className="w-7 h-7 rounded-full bg-red-100 justify-center items-center mr-2">
                                    <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
                                </View>
                                <Text className="text-[14px] font-bold text-slate-800">Custom Date Range</Text>
                            </View>
                            {isFilterApplied && (
                                <TouchableOpacity
                                    onPress={clearFilter}
                                    className="flex-row items-center bg-red-50 px-2.5 py-1 rounded-full border border-red-100"
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="refresh-outline" size={13} color="#dc2626" style={{ marginRight: 3 }} />
                                    <Text className="text-[11px] font-bold text-red-600">Reset</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="flex-row items-center gap-2">
                            {/* Start Date */}
                            <View className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-2 justify-center items-center">
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

                            <Text className="text-slate-400 font-bold text-[13px]">to</Text>

                            {/* End Date */}
                            <View className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-2 justify-center items-center">
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

                            {/* Search Button */}
                            <TouchableOpacity
                                onPress={() => chooseFilter(true)}
                                className="w-11 h-11 bg-[#E0211F] rounded-xl justify-center items-center"
                                style={{ elevation: 2 }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="search" color="white" size={18} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Section Header with active filter badge */}
                    <View className="flex-row items-center justify-between mb-3 px-1">
                        <Text className="text-[15px] font-extrabold text-slate-800">Booking Summary</Text>
                        <View className="bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                            <Text className="text-[11px] font-bold text-slate-600">{getActiveFilterLabel()}</Text>
                        </View>
                    </View>

                    {/* Total Bookings Hero Card */}
                    <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-4" style={{ elevation: 2 }}>
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="w-11 h-11 rounded-2xl bg-red-50 justify-center items-center border border-red-100">
                                <Ionicons name="car-sport" size={22} color={COLORS.primary} />
                            </View>
                            <View className="bg-red-50 px-2.5 py-1 rounded-full">
                                <Text className="text-[11px] font-extrabold text-[#E0211F]">Total Volume</Text>
                            </View>
                        </View>

                        <Text className="text-[32px] font-black text-slate-900 tracking-tight">
                            {total}
                        </Text>
                        <Text className="text-[13px] font-semibold text-slate-500 mt-0.5">
                            Total Bookings Placed
                        </Text>
                    </View>

                    {/* Dual Grid Cards: Completed & Cancelled */}
                    <View className="flex-row gap-3 mb-4">
                        {/* Completed Bookings Card */}
                        <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100" style={{ elevation: 2 }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-9 h-9 rounded-xl bg-emerald-50 justify-center items-center border border-emerald-100">
                                    <Ionicons name="checkmark-done-circle" size={18} color="#15803d" />
                                </View>
                                <View className="bg-emerald-50 px-2 py-0.5 rounded-md">
                                    <Text className="text-[11px] font-bold text-emerald-700">{completionRate}%</Text>
                                </View>
                            </View>

                            <Text className="text-[24px] font-black text-slate-900">
                                {completed}
                            </Text>
                            <Text className="text-[12px] font-semibold text-slate-500 mt-0.5 mb-2">
                                Completed
                            </Text>

                            {/* Progress Bar */}
                            <View className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                                />
                            </View>
                        </View>

                        {/* Cancelled Bookings Card */}
                        <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100" style={{ elevation: 2 }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-9 h-9 rounded-xl bg-red-50 justify-center items-center border border-red-100">
                                    <Ionicons name="close-circle" size={18} color="#dc2626" />
                                </View>
                                <View className="bg-red-50 px-2 py-0.5 rounded-md">
                                    <Text className="text-[11px] font-bold text-red-600">{cancellationRate}%</Text>
                                </View>
                            </View>

                            <Text className="text-[24px] font-black text-slate-900">
                                {cancelled}
                            </Text>
                            <Text className="text-[12px] font-semibold text-slate-500 mt-0.5 mb-2">
                                Cancelled
                            </Text>

                            {/* Progress Bar */}
                            <View className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${Math.min(cancellationRate, 100)}%` }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Trip Performance Ratio Breakdown Card */}
                    <View className="bg-white rounded-2xl p-4 border border-slate-100" style={{ elevation: 2 }}>
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-[13px] font-bold text-slate-800">Trip Success Rate</Text>
                            <Text className="text-[13px] font-extrabold text-emerald-700">{completionRate}%</Text>
                        </View>

                        {/* Split Visual Bar */}
                        <View className="w-full h-2.5 bg-slate-100 rounded-full flex-row overflow-hidden mb-3">
                            <View
                                className="h-full bg-emerald-500"
                                style={{ width: `${Math.min(completionRate, 100)}%` }}
                            />
                            <View
                                className="h-full bg-red-500"
                                style={{ width: `${Math.min(cancellationRate, 100)}%` }}
                            />
                        </View>

                        <View className="flex-row justify-between pt-1">
                            <View className="flex-row items-center">
                                <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
                                <Text className="text-[11px] text-slate-500 font-medium">Completed ({completed})</Text>
                            </View>
                            <View className="flex-row items-center">
                                <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5" />
                                <Text className="text-[11px] text-slate-500 font-medium">Cancelled ({cancelled})</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default Statistics;