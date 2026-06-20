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
    ToastAndroid
} from "react-native";
import Header from "../../../../Common/Header/index";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "react-native-vector-icons/AntDesign";
import { createBookings, PaymentTypeService } from "./helper";
import { Picker } from "@react-native-picker/picker";
import ModalBooking from "./modalBookingScreen";
import { Google_Key } from "../../../../../environment/ApiManager";
import MapsPage from "./GooglrMap";
import { COLORS } from "../../../../utils/ColorCode";

const BookingScreen = () => {
    const value = "Book Your Trip";
    const navigation: any = useNavigation();
    const route = useRoute();
    const { TripDetails }: any = route.params || {};
    const [tripData, setTripData] = useState<any>(null);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [token, setToken] = useState<any>(null);
    const [loader, setLoader] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: 0,
        longitude: 0,
    });

    const gearTypeData = [
        { label: 'All', value: 'All' },
        { label: 'Automatic', value: 'Automatic' },
        { label: 'Manual', value: 'Manual' }
    ];

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
    const [hours, setHours] = useState(null);
    const [gearType, setGearType] = useState(null);

    const [estimateAmount, setEstimateAmount] = useState<any>(null);
    const [razorpayOrderId, setRazorpayOrderId] = useState<boolean>(false);

    const [isVisible, setIsVisible] = useState<boolean>(false);

    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

    const showStartDatePicker = () => setStartDatePickerVisibility(true);
    const hideStartDatePicker = () => setStartDatePickerVisibility(false);

    const handleStartDateConfirm = (date: any) => {
        setStartDate(date);
        clearError("startDate");
        hideStartDatePicker();
    };

    const handleCurrentLocation = (latitude: any, longitude: any) => {
        setCurrentLocation({ latitude: latitude, longitude: longitude });
    };

    const clearError = (key: keyof typeof errData) => {
        setErrData(prev => ({ ...prev, [key]: false }));
    };
    
    const goTOContinue = () => {

        const errors = {
            name: !name,
            address: !address,
            mobileNumber: !mobileNumber,
            startDate: !startDate,
            gearType: !gearType,
            hours: !hours,
        };

        setErrData(errors);

        const hasError = Object.values(errors).some(Boolean);

        if (hasError) {
            ToastAndroid.show("Require all fields", ToastAndroid.SHORT);
        } else {
            const selectedTrips = tripData.find(
                (item: any) => Number(item.hours) === Number(hours)
            );
            setSelectedTrip(selectedTrips)
            setIsVisible(true);
        }
    };


    const handleBooking = async () => {
        const data = {
            "Name": name,
            "Address": address,
            "MobileNo": mobileNumber,
            "StartDate": startDate.toString(),
            "EndDate": null,
            "GearType": gearType,
            "Hours": hours,
            "EstimateAmount": estimateAmount,
            "LocationCode": {
                // "lat": currentLocation.latitude,
                // "long": currentLocation.longitude
                "lat": 13.051280, "long": 80.213531
            },
            "Status": "Created",
            "PaymentStatus": razorpayOrderId ? "Paid" : "UnPaid"
        }
        
        try {   
            const response = await createBookings(token, data);
            if (response.data.status === 201) {
                navigation.navigate('OwnerHome');
                setName("");
                setAddress("");
                setMobileNumber("");
                setStartDate(null);
                setGearType(null);
            }
        } catch (error: any) {
            
            ToastAndroid.show(error?.response?.data?.message, ToastAndroid.SHORT);
        }
    }

    const renderGearTypeData = ({ item }: any) => {
        return (
            <TouchableOpacity
                style={{ marginHorizontal: 5 }}
                className={`p-[10px] border rounded-[5px] ${gearType === item.value ? "border-blue-600" : "border-[#ccc]"}`}
                onPress={() => {
                    setGearType(item.value)
                    clearError("gearType");
                }}
            >
                <Text className={`${gearType === item.value ? "text-blue-600" : "text-black"}`}>{item.value}</Text>
            </TouchableOpacity>
        )
    }

    const handleAddressChange = (value: string) => {
        setAddress(value);
        if (value) clearError("address");
    };
    

    const handleTripPaymentDetails = async (TripDetails: any, token: any) => {
        setLoader(true);
        try {
            const res = await PaymentTypeService(TripDetails.id, token)
            const { success, message, data } = res?.data;
            console.log("123",JSON.stringify(res));
            
            if (success === true) {
                setTripData(data)
            } else {
                console.log(message);
            }
        } catch (error) {
            console.log(error);

        } finally {
            setLoader(false);
        }
    }

    useEffect(() => {
        handleTripPaymentDetails(TripDetails, token);
    }, [TripDetails, token])
    
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem("UserData");
                const tokens = await AsyncStorage.getItem("token");
                if (storedUserData && tokens) {
                    setToken(tokens);
                }
            } catch (error) {
                console.error("Error fetching user data from AsyncStorage:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 " style={{backgroundColor: COLORS.primary}}>
                <View className="flex-1 justify-center items-center">
                    <Header value={value} />
                </View>

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

                                {/* <View className="mb-[15px] w-full justify-around"> */}
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

                                    {/* <View className="mb-[15px] w-full">
                                        <Text className={`mb-[5px] text-black font-semibold`}>End Date</Text>
                                        <TouchableOpacity onPress={showEndDatePicker} className="w-[99%] h-[40px] border-0.5 border-black justify-center rounded-[5px]">
                                            <View className="justify-between flex-row">
                                                <Text className={`${startDate ? "text-[#000]" : "text-gray-500"} left-2`}>
                                                    {endDate ? endDate.toDateString() : "Select Date"}
                                                </Text>
                                                <AntDesign name="calendar" size={16} color={"black"} style={{ right: 10 }} />
                                            </View>
                                        </TouchableOpacity>
                                        <DateTimePicker
                                            isVisible={isEndDatePickerVisible}
                                            mode="date"
                                            onConfirm={handleEndDateConfirm}
                                            onCancel={hideEndDatePicker}
                                            minimumDate={startDate} // today
                                            maximumDate={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 4)) : null}
                                        />

                                    </View> */}

                                {/* </View> */}

                                <View className="mb-[15px]">
                                    <Text className={`mb-[5px] ${errData.hours ? "text-red-400" : "text-black"} font-semibold`}>
                                        Select Hours
                                    </Text>

                                    {tripData !== null &&
                                        <View className="w-[99%] h-[40px] border-0.5 border-black justify-center rounded-[5px]">
                                            <Picker
                                                selectedValue={hours}
                                                onValueChange={(itemValue) => {
                                                    setHours(itemValue);
                                                    if (itemValue) clearError("hours");
                                                }}
                                            >
                                                <Picker.Item label="Select Hours" value="" />

                                                {tripData.map((item: any) => (
                                                    <Picker.Item
                                                        key={item.id}
                                                        label={`${Number(item.hours)} hours`}
                                                        value={Number(item.hours)}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    }
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
                                <View style={{backgroundColor: COLORS.primary}} className="p-[15px] rounded-[10px] w-[150px] items-center">
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

                        <ModalBooking isVisible={isVisible} token={token} hours={hours} setIsVisible={setIsVisible} setEstimateAmount={setEstimateAmount} handleBooking={handleBooking} setRazorpayOrderId={setRazorpayOrderId} TripDetails={selectedTrip} />
                    </ScrollView>
                </View>

            </View>
        </TouchableWithoutFeedback>
    );
};

export default BookingScreen;
