import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StatusBar,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
    FlatList,
    ToastAndroid,
    Modal
} from "react-native";
import Header from "../../../../Common/Header/index";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "react-native-vector-icons/AntDesign";
import { createBookings, GetGearTypeService, PaymentTypeService } from "./helper";
import { Picker } from "@react-native-picker/picker";
import ModalBooking from "./modalBookingScreen";
import { Google_Key } from "../../../../../environment/ApiManager";
import MapsPage from "./GooglrMap";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";
import Loader from "../../../../Common/Loader";

const BookingScreen = () => {
    const value = "Book Your Trip";
    const navigation: any = useNavigation();
    const route = useRoute();
    const { TripDetails }: any = route.params || {};
    const [tripData, setTripData] = useState<any>(null);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [loader, setLoader] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: 0,
        longitude: 0,
    });
    const [gearTypeData, setGearTypeData] = useState<any[]>([]);

    const [errData, setErrData] = useState({
        name: false,
        address: false,
        mobileNumber: false,
        startDate: false,
        gearType: false,
        hours: false,
    });

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [startDate, setStartDate] = useState<any>(null);
    const [hours, setHours] = useState<any>(null);
    const [gearType, setGearType] = useState(null);

    const [estimateAmount, setEstimateAmount] = useState<any>(null);

    const [isVisible, setIsVisible] = useState<boolean>(false);

    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [isHoursDropdownVisible, setIsHoursDropdownVisible] = useState(false);

    const showStartDatePicker = () => setStartDatePickerVisibility(true);
    const hideStartDatePicker = () => setStartDatePickerVisibility(false);

    const handleStartDateConfirm = (date: any) => {
        setStartDate(date);
        clearError("startDate");
        hideStartDatePicker();
    };

    const handleCurrentLocation = (coordinate: any) => {
        setCurrentLocation({ latitude: coordinate?.latitude, longitude: coordinate?.longitude });
    };

    const clearError = (key: keyof typeof errData) => {
        setErrData(prev => ({ ...prev, [key]: false }));
    };

    const goTOContinue = () => {
        const errors = {
            name: !name,
            address: !address,
            mobileNumber: !mobileNumber || !/^[0-9]{10}$/.test(mobileNumber),
            startDate: !startDate,
            gearType: !gearType,
            hours: !hours,
        };

        setErrData(errors);

        const hasError = Object.values(errors).some(Boolean);

        if (hasError) {
            if (!mobileNumber) {
                showError("Mobile number is required");
            } else if (!/^[0-9]{10}$/.test(mobileNumber)) {
                showError("Mobile number must be exactly 10 digits");
            } else {
                showError("Require all fields");
            }
            return;
        }

        const selectedTrips = tripData.find(
            (item: any) => Number(item.hours) === Number(hours)
        );

        setSelectedTrip(selectedTrips);
        setIsVisible(true);
    };

    const handleBooking = async () => {

        const data = {
            Name: name,
            Address: address,
            MobileNo: mobileNumber,
            StartDate: startDate.toString(),
            EndDate: null,
            GearType: gearType,
            Hours: hours,
            LocationCode: {
                "lat": currentLocation.latitude,
                "long": currentLocation.longitude
            },
            Status: "Created",
            PaymentStatus: "UnPaid",
            TripTypeId: TripDetails.id
        }
        console.log(data);

        try {
            const response = await createBookings(data);

            if (response.data.status === 201) {
                setIsVisible(false);
                navigation.navigate('OwnerHome');
                setName("");
                setAddress("");
                setMobileNumber("");
                setStartDate(null);
                setGearType(null);
            }
        } catch (error: any) {

            showError(error?.response?.data?.message);
        }
    }

    const renderGearTypeData = ({ item }: any) => {

        return (
            <TouchableOpacity
                style={{ marginHorizontal: 5 }}
                className={`p-[10px] border rounded-[5px] ${gearType === item ? "border-blue-600" : "border-[#ccc]"}`}
                onPress={() => {
                    setGearType(item)
                    clearError("gearType");
                }}
            >
                <Text className={`${gearType === item ? "text-blue-600" : "text-black"}`}>{item}</Text>
            </TouchableOpacity>
        )
    }

    const handleAddressChange = (value: string) => {
        setAddress(value);
        if (value) clearError("address");
    };


    const handleTripPaymentDetails = async (TripDetails: any) => {
        setLoader(true);
        try {
            const res = await PaymentTypeService(TripDetails.id)
            const { success, message, data } = res?.data;

            if (success === true) {
                setTripData(data)
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);

        } finally {
            setLoader(false);
        }
    }

    const fetchGearTypes = async () => {
        setLoader(true);
        try {
            const res = await GetGearTypeService();
            const { data: { success = false, message = '', data = [] } } = res;

            if (success === true) {
                setGearTypeData(data)
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);

        } finally {
            setLoader(false);
        }
    }

    useEffect(() => {
        handleTripPaymentDetails(TripDetails);
    }, [TripDetails])

    useEffect(() => {
        fetchGearTypes()
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 " style={{ backgroundColor: COLORS.primary }}>
                <View className="flex-1 justify-center items-center">
                    <Header value={value} />
                </View>

                {loader && (
                    <View style={{ position: "absolute", height: "100%", width: "100%", zIndex: 10, }}>
                        <Loader />
                    </View>
                )}

                <View className="flex-[9] bg-white rounded-t-[30px] w-full p-1">
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                        <View className="flex-[2] justify-center items-center">

                            <View className="p-[10px] rounded-[10px] w-[95%]">

                                <View className="mb-[15px]">
                                    <Text className={`mb-[5px] ${errData.name ? "text-red-400" : "text-black"} font-semibold`}>Name</Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: "#ccc",
                                            borderRadius: 8,
                                            padding: 10,
                                            color: "#000",
                                        }}
                                        placeholder="Enter Name"
                                        placeholderTextColor="gray"
                                        value={name}
                                        onChangeText={(text) => {
                                            setName(text)
                                            if (text) clearError("name");
                                        }}
                                    />

                                </View>

                                <View className="mb-[15px]">
                                    <Text className={`mb-[5px] ${errData.address ? "text-red-400" : "text-black"} font-semibold`}>Address</Text>
                                    <View className="border border-[#ccc] p-2">
                                        <MapsPage handleCurrentLocation={handleCurrentLocation} setAddress={handleAddressChange} address={address} />
                                    </View>
                                </View>

                                <View className="mb-[15px]">
                                    <Text className={`mb-[5px] ${errData.mobileNumber ? "text-red-400" : "text-black"} font-semibold`}>Mobile No</Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: "#ccc",
                                            borderRadius: 8,
                                            padding: 10,
                                            color: "#000",
                                        }}
                                        placeholder="Enter Mobile Number"
                                        placeholderTextColor="gray"
                                        keyboardType="numeric"
                                        value={mobileNumber}
                                        onChangeText={(text) => {
                                            const cleaned = text.replace(/[^0-9]/g, '');
                                            setMobileNumber(cleaned);
                                            if (cleaned.length > 0) clearError("mobileNumber");
                                        }}
                                    />

                                </View>

                                <View className={`mb-[15px] w-full`}>
                                    <Text className={`mb-[5px] ${errData.startDate ? "text-red-400" : "text-black"} font-semibold`}>Journey Date</Text>
                                    <TouchableOpacity onPress={showStartDatePicker} className="w-[99%] h-[40px] border-0.5 border-black justify-center rounded-[5px]">
                                        <View className="justify-between flex-row">
                                            <Text className={`${startDate ? "text-[#000]" : "text-gray-500"} left-2`}>
                                                {startDate
                                                    ? startDate.toDateString()
                                                    : "Select Date"}
                                            </Text>
                                            <AntDesign name="calendar" size={16} color={"black"} style={{ right: 10 }} />
                                        </View>
                                    </TouchableOpacity>
                                    <DateTimePicker
                                        isVisible={isStartDatePickerVisible}
                                        mode="datetime"
                                        onConfirm={handleStartDateConfirm}
                                        onCancel={hideStartDatePicker}
                                        minimumDate={new Date()}
                                    />
                                </View>

                                <View className="mb-[15px]">
                                    <Text
                                        className={`mb-[5px] ${errData.hours ? "text-red-400" : "text-black"
                                            } font-semibold`}
                                    >
                                        Select Hours
                                    </Text>

                                    {tripData !== null && (
                                        <>
                                            {/* Dropdown Button */}
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => setIsHoursDropdownVisible(true)}
                                                className="w-[99%] h-[40px] border border-black justify-center rounded-[5px]"
                                            >
                                                <View className="flex-row items-center justify-between px-3">
                                                    <Text
                                                        className={
                                                            hours
                                                                ? "text-black"
                                                                : "text-gray-500"
                                                        }
                                                    >
                                                        {hours
                                                            ? `${Number(hours)} hours`
                                                            : "Select Hours"}
                                                    </Text>

                                                    <AntDesign
                                                        name={
                                                            isHoursDropdownVisible
                                                                ? "up"
                                                                : "down"
                                                        }
                                                        size={14}
                                                        color="black"
                                                    />
                                                </View>
                                            </TouchableOpacity>

                                            {/* Dropdown Modal */}
                                            <Modal
                                                visible={isHoursDropdownVisible}
                                                transparent
                                                animationType="fade"
                                                onRequestClose={() =>
                                                    setIsHoursDropdownVisible(false)
                                                }
                                            >
                                                <TouchableWithoutFeedback
                                                    onPress={() =>
                                                        setIsHoursDropdownVisible(false)
                                                    }
                                                >
                                                    <View
                                                        className="flex-1 justify-center items-center"
                                                        style={{
                                                            backgroundColor: "rgba(0,0,0,0.3)",
                                                        }}
                                                    >
                                                        <TouchableWithoutFeedback>
                                                            <View
                                                                className="bg-white rounded-[10px] w-[85%]"
                                                                style={{
                                                                    maxHeight: 300,
                                                                    elevation: 5,
                                                                    shadowColor: "#000",
                                                                    shadowOffset: {
                                                                        width: 0,
                                                                        height: 2,
                                                                    },
                                                                    shadowOpacity: 0.25,
                                                                    shadowRadius: 4,
                                                                }}
                                                            >
                                                                {/* Dropdown Header */}
                                                                <View className="p-4 border-b border-[#eee]">
                                                                    <Text className="text-black font-semibold text-[16px]">
                                                                        Select Hours
                                                                    </Text>
                                                                </View>

                                                                {/* Options */}
                                                                <FlatList
                                                                    data={tripData}
                                                                    keyExtractor={(item: any) =>
                                                                        item.id.toString()
                                                                    }
                                                                    renderItem={({ item }: any) => {
                                                                        const selected =
                                                                            Number(hours) ===
                                                                            Number(item.hours);

                                                                        return (
                                                                            <TouchableOpacity
                                                                                activeOpacity={0.7}
                                                                                onPress={() => {
                                                                                    setHours(
                                                                                        Number(item.hours)
                                                                                    );
                                                                                    clearError("hours");
                                                                                    setIsHoursDropdownVisible(
                                                                                        false
                                                                                    );
                                                                                }}
                                                                                className={`px-4 py-3 border-b border-[#eee] ${selected
                                                                                        ? "bg-gray-100"
                                                                                        : "bg-white"
                                                                                    }`}
                                                                            >
                                                                                <View className="flex-row items-center justify-between">
                                                                                    <Text
                                                                                        className={`text-[15px] ${selected
                                                                                                ? "text-blue-600 font-semibold"
                                                                                                : "text-black"
                                                                                            }`}
                                                                                    >
                                                                                        {Number(
                                                                                            item.hours
                                                                                        )}{" "}
                                                                                        hours
                                                                                    </Text>

                                                                                    {selected && (
                                                                                        <AntDesign
                                                                                            name="check"
                                                                                            size={16}
                                                                                            color="blue"
                                                                                        />
                                                                                    )}
                                                                                </View>
                                                                            </TouchableOpacity>
                                                                        );
                                                                    }}
                                                                />

                                                                {/* Cancel */}
                                                                <TouchableOpacity
                                                                    onPress={() =>
                                                                        setIsHoursDropdownVisible(false)
                                                                    }
                                                                    className="p-4 items-center"
                                                                >
                                                                    <Text className="text-red-500 font-semibold">
                                                                        Cancel
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </TouchableWithoutFeedback>
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            </Modal>
                                        </>
                                    )}
                                </View>


                                <View className="mb-[15px]">
                                    <View>
                                        <Text className={`mb-[5px] ${errData.gearType ? "text-red-400" : "text-black"} font-semibold`}>Gear Type</Text>
                                    </View>
                                    <View>
                                        <FlatList
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            data={gearTypeData}
                                            renderItem={renderGearTypeData}
                                            keyExtractor={(item) => item.value} // Ensure each item has a unique key
                                            contentContainerStyle={{ paddingHorizontal: 10 }}
                                        />
                                    </View>

                                </View>
                            </View>
                        </View>

                        <View className="flex-1 items-center">
                            <TouchableOpacity onPress={goTOContinue}>
                                <View style={{ backgroundColor: COLORS.primary }} className="p-[15px] rounded-[10px] w-[150px] items-center">
                                    <Text className="text-white font-semibold">Continue</Text>
                                </View>
                            </TouchableOpacity>
                            {/* <TouchableOpacity
                            // onPress={handleFormSubmission}
                            >
                                <View className="bg-[#5a639c] p-[15px] rounded-[10px] w-[150px] items-center">
                                    <Text className="text-white font-semibold">Submit</Text>
                                </View>
                            </TouchableOpacity> */}
                        </View>

                        <ModalBooking isVisible={isVisible} hours={hours} setIsVisible={setIsVisible} setEstimateAmount={setEstimateAmount} handleBooking={handleBooking} TripDetails={selectedTrip} />
                    </ScrollView>
                </View>

            </View>
        </TouchableWithoutFeedback>
    );
};

export default BookingScreen;
