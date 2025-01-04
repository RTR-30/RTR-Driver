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
    FlatList
} from "react-native";
import Header from "../../../../Common/Header/index";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "react-native-vector-icons/AntDesign";
import { FetchBooking } from "./helper";
import { Picker } from "@react-native-picker/picker";

const BookingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [user, setUser] = useState<any>(null);

    const { TripMode }: any = route.params || {};

    console.log('====================================');
    console.log(TripMode);
    console.log('====================================');

    const value = "Booking";
    const gearTypeData = [
        { label: 'All', value: 'All' },
        { label: 'Automatic', value: 'Automatic' },
        { label: 'Manual', value: 'Manual' }
    ];

    const [errName, setErrName] = useState(false);
    const [errAddress, setErrAddress] = useState(false);
    const [errMobileNumber, setErrMobileNumber] = useState(false);
    const [errStartDate, setErrStartDate] = useState(false);
    const [errEndDate, setErrEndDate] = useState(false);
    const [errGearType, setErrGearType] = useState(false);

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [gearType, setGearType] = useState(null);
    const [tripMode, setTripMode] = useState<any>(TripMode);

    console.log('====================================');
    console.log(typeof(tripMode));
    console.log('====================================');

    const [localHours, setLocalHours] = useState("Select hours");
    const [OutstationHours, setOutstationHours] = useState("Select hours");

    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

    const showStartDatePicker = () => setStartDatePickerVisibility(true);
    const hideStartDatePicker = () => setStartDatePickerVisibility(false);

    const handleStartDateConfirm = (date: any) => {
        setStartDate(date);
        hideStartDatePicker();
    };

    const showEndDatePicker = () => {
        setEndDatePickerVisibility(true);
    }
    const hideEndDatePicker = () => {
        setEndDatePickerVisibility(false);
    }

    const handleEndDateConfirm = (date: any) => {
        setEndDate(date);
        hideEndDatePicker();
    };

    const handleFormSubmission = () => {

        if (TripMode === "Outstation") {
            if (!name || !address || !mobileNumber || !startDate || !endDate || !gearType) {
                setErrName(!name);
                setErrAddress(!address);
                setErrMobileNumber(!mobileNumber);
                setErrStartDate(!startDate);
                setErrEndDate(!endDate);
                setErrGearType(!gearType);
            } else {
                // navigation.navigate("OwnerHome")
                handleBooking();
            }
        } else {
            if (!name || !address || !mobileNumber || !startDate || !gearType) {
                setErrName(!name);
                setErrAddress(!address);
                setErrMobileNumber(!mobileNumber);
                setErrStartDate(!startDate);
                setErrGearType(!gearType);
            } else {
                handleBooking();
            }
        }

    };

    const handleBooking = async () => {
        const userId = user.id;
        const hours = TripMode === "Outstation" ? OutstationHours : localHours;
        const formData = {
            name,
            address,
            mobileNumber,
            startDate,
            endDate,
            gearType,
            hours,
            tripMode,
        }
        try {
            const response = await FetchBooking(userId, formData);
            console.log('====================================');
            console.log(response.data);
            console.log('====================================');
            if (response.status === 200) {
                navigation.navigate('OwnerHome');
                setName("");
                setAddress("");
                setMobileNumber("");
                setStartDate(null);
                setEndDate(null);
                setGearType(null);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const renderGearTypeData = ({ item }: any) => {
        return (
            <TouchableOpacity
                style={{
                    padding: 10,
                    borderColor: gearType === item.value ? "blue" : "#ccc",
                    borderWidth: 1,
                    borderRadius: 5,
                    marginHorizontal: 5,
                }}
                onPress={() => setGearType(item.value)}
            >
                <Text style={{ color: gearType === item.value ? "blue" : "black" }}>{item.value}</Text>
            </TouchableOpacity>
        )
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem("UserData");
                if (storedUserData) {
                    setUser(JSON.parse(storedUserData));
                }
            } catch (error) {
                console.error("Error fetching user data from AsyncStorage:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor: "#5a639c" }}>
                <StatusBar backgroundColor={"#5a639c"} barStyle={"dark-content"} />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Header value={value} />
                </View>

                <View style={{ flex: 9, backgroundColor: "white", borderTopStartRadius: 40, borderTopEndRadius: 40, width: "100%",padding:10 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                        <View style={{ flex: 2, justifyContent: "center", alignItems: "center", }}>

                            <View style={{ padding: 10, marginVertical: 10, borderRadius: 10, backgroundColor: "#f7f7f7", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 5, width: "90%" }}>

                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ marginBottom: 5, color: 'black', fontWeight: '600' }}>Name</Text>
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
                                        onChangeText={(text) => setName(text)}
                                    />
                                    {errName && <Text style={{ color: "red", fontWeight: "400", }}>name is required</Text>}
                                </View>

                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ marginBottom: 5, color: 'black', fontWeight: '600' }}>Address</Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: "#ccc",
                                            borderRadius: 8,
                                            padding: 10,
                                            color: "#000",
                                            width: '100%',
                                            textAlignVertical: 'top',
                                            height: 60,
                                        }}
                                        multiline={ true}
                                        numberOfLines={3}
                                        placeholder="Enter Address"
                                        placeholderTextColor="gray"
                                        value={address}
                                        onChangeText={(text) => setAddress(text)}
                                    />
                                    {errAddress && <Text style={{ color: "red", fontWeight: "400", }}>address is required</Text>}
                                </View>

                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ marginBottom: 5, color: 'black', fontWeight: '600' }}>Mobile No</Text>
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
                                        value={mobileNumber}
                                        onChangeText={(text) => setMobileNumber(text)}
                                    />
                                    {errMobileNumber && <Text style={{ color: "red", fontWeight: "400", }}>mobile number is required</Text>}
                                </View>

                                <View style={{ marginBottom: 15, flexDirection:'row' , width: '100%', justifyContent:'space-around' }}>

                                    <View style={{ marginBottom: 15, width: TripMode === "Outstation" ? '48%' : '100%' }}>
                                        <Text style={{ marginBottom: 5, color: 'black', fontWeight: '600' }}>Journey Date</Text>
                                        <TouchableOpacity onPress={showStartDatePicker} style={{ width: '99%', height: 40, borderWidth: 0.5, borderColor: 'black', justifyContent: 'center', borderRadius: 5 }}>
                                            <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                                <Text style={{ color: startDate ? "#000" : "gray" }}>
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
                                        />
                                        {errStartDate && <Text style={{ color: "red", fontWeight: "400", }}>start date is required</Text>}
                                    </View>

                                    {
                                        TripMode === "Outstation" && (
                                            <View style={{ marginBottom: 15, width: '48%' }}>
                                                <Text style={{ marginBottom: 5, color: 'black', fontWeight: '600' }}>End Date</Text>
                                                <TouchableOpacity onPress={showEndDatePicker} style={{ width: '99%', height: 40, borderWidth: 0.5, borderColor: 'black', justifyContent: 'center', borderRadius: 5 }}>
                                                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                                        <Text style={{ color: endDate ? "#000" : "gray" }}>
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
                                                />
                                                {errEndDate && <Text style={{ color: "red", fontWeight: "400", }}>end date is required</Text>}
                                            </View>
                                        )
                                    }
                                </View>

                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ marginBottom: 5, color: 'black', fontWeight: '600' }}>Select Hours</Text>
                                    <View>
                                        {
                                            TripMode === "Outstation" ? (
                                                <Picker
                                                    selectedValue={OutstationHours}
                                                    style={{ height: 50, width: 250 }}
                                                    mode={"dialog"}
                                                    onValueChange={(itemValue) => setOutstationHours(itemValue)}
                                                >
                                                    <Picker.Item label="Select" value="Select" />
                                                    <Picker.Item label="6 hours" value="6" />
                                                    <Picker.Item label="12 hours" value="12" />
                                                    <Picker.Item label="1 day" value="1" />
                                                    <Picker.Item label="2 days" value="2" />
                                                </Picker>
                                            ) : (
                                                <Picker
                                                    selectedValue={localHours}
                                                    style={{ height: 50, width: 250 }}
                                                    mode={"dialog"}
                                                    onValueChange={(itemValue) => setLocalHours(itemValue)}
                                                >
                                                    <Picker.Item label="Select" value="Select" />
                                                    <Picker.Item label="4 hours" value="4" />
                                                    <Picker.Item label="8 hours" value="8" />
                                                    <Picker.Item label="12 hours" value="12" />
                                                </Picker>
                                            )
                                        }
                                    </View>
                                </View>

                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ marginBottom: 5, color: 'black', fontWeight: '600' }}>Gear Type</Text>
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
                                    {errGearType && <Text style={{ color: "red", fontWeight: "400", }}>gear-type is required</Text>}
                                </View>
                            </View>
                        </View>

                        <View style={{ flex: 1, alignItems: "center" }}>
                            <TouchableOpacity onPress={handleFormSubmission}>
                                <View style={{ backgroundColor: "#5a639c", padding: 15, borderRadius: 10, width: 150, alignItems: "center", }}>
                                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Submit</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default BookingScreen;
