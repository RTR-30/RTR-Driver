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
    Modal,
    StyleSheet,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../../Common/Header/index";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "react-native-modal-datetime-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createBookings, GetGearTypeService, PaymentTypeService } from "./helper";
import ModalBooking from "./modalBookingScreen";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";
import Loader from "../../../../Common/Loader";

const BookingScreen = () => {
    const value = "Book Your Trip";
    const navigation: any = useNavigation();
    const route = useRoute();
    const { TripDetails, address: paramAddress, coordinate: paramCoordinate }: any = route.params || {};

    const [tripData, setTripData] = useState<any>(null);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [loader, setLoader] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<any>(
        paramCoordinate || {
            latitude: 0,
            longitude: 0,
        }
    );
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
    const [address, setAddress] = useState(paramAddress || "");
    const [mobileNumber, setMobileNumber] = useState("");
    const [startDate, setStartDate] = useState<any>(null);
    const [hours, setHours] = useState<any>(null);
    const [gearType, setGearType] = useState<any>(null);

    const [estimateAmount, setEstimateAmount] = useState<any>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isHoursDropdownVisible, setIsHoursDropdownVisible] = useState(false);

    const showStartDatePicker = () => setStartDatePickerVisibility(true);
    const hideStartDatePicker = () => setStartDatePickerVisibility(false);

    const handleStartDateConfirm = (date: any) => {
        setStartDate(date);
        clearError("startDate");
        hideStartDatePicker();
    };

    const clearError = (key: keyof typeof errData) => {
        setErrData((prev) => ({ ...prev, [key]: false }));
    };

    const handleAddressChange = (value: string) => {
        setAddress(value);
        if (value) clearError("address");
    };

    const formatJourneyDate = (date: any) => {
        if (!date) return "Select Journey Date & Time";
        const d = new Date(date);
        return d.toLocaleString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const goTOContinue = () => {
        const errors = {
            name: !name || !name.trim(),
            address: !address || !address.trim(),
            mobileNumber: !mobileNumber || !/^[0-9]{10}$/.test(mobileNumber),
            startDate: !startDate,
            gearType: !gearType,
            hours: !hours,
        };

        setErrData(errors);

        const hasError = Object.values(errors).some(Boolean);

        if (hasError) {
            if (!name || !name.trim()) {
                showError("Please enter your name");
            } else if (!mobileNumber) {
                showError("Mobile number is required");
            } else if (!/^[0-9]{10}$/.test(mobileNumber)) {
                showError("Mobile number must be exactly 10 digits");
            } else if (!address || !address.trim()) {
                showError("Please enter pickup address");
            } else if (!startDate) {
                showError("Please select journey date and time");
            } else if (!hours) {
                showError("Please select trip duration");
            } else if (!gearType) {
                showError("Please select gear type");
            } else {
                showError("Please fill all required fields");
            }
            return;
        }

        const selectedTrips = tripData?.find(
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
                lat: currentLocation?.latitude || 0,
                long: currentLocation?.longitude || 0,
            },
            Status: "Created",
            PaymentStatus: "UnPaid",
            TripTypeId: TripDetails?.id,
        };

        try {
            const response = await createBookings(data);
            if (response.data.status === 201) {
                setIsVisible(false);
                navigation.navigate("OwnerHome");
                setName("");
                setAddress("");
                setMobileNumber("");
                setStartDate(null);
                setGearType(null);
            }
        } catch (error: any) {
            showError(error?.response?.data?.message || "Booking failed. Please try again.");
        }
    };

    const handleTripPaymentDetails = async (details: any) => {
        if (!details?.id) return;
        setLoader(true);
        try {
            const res = await PaymentTypeService(details.id);
            const { success, message, data } = res?.data;

            if (success === true) {
                setTripData(data);
                // Preselect first duration if available
                if (data && data.length > 0 && !hours) {
                    setHours(Number(data[0].hours));
                }
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoader(false);
        }
    };

    const fetchGearTypes = async () => {
        setLoader(true);
        try {
            const res = await GetGearTypeService();
            const { data: { success = false, message = "", data = [] } } = res;

            if (success === true) {
                setGearTypeData(data);
                // Auto select first gear type if none selected
                if (data.length > 0 && !gearType) {
                    setGearType(data[0]);
                }
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        if (TripDetails) {
            handleTripPaymentDetails(TripDetails);
        }
    }, [TripDetails]);

    useEffect(() => {
        fetchGearTypes();
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.rootContainer} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

                {/* Top Header */}
                <View style={styles.headerWrapper}>
                    <Header value={value} />
                </View>

                {loader && (
                    <View style={styles.loaderOverlay}>
                        <Loader />
                    </View>
                )}

                {/* Main Content Area */}
                <SafeAreaView edges={['bottom']} style={styles.contentContainer}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* 1. Trip Type Summary Banner */}
                        <View style={styles.tripBannerCard}>
                            <View style={styles.tripIconCircle}>
                                <Ionicons name="car-sport" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.tripBannerTextWrapper}>
                                <View style={styles.tripBadgeRow}>
                                    <View style={styles.tripBadge}>
                                        <Text style={styles.tripBadgeText}>SELECTED PLAN</Text>
                                    </View>
                                </View>
                                <Text style={styles.tripTitleText}>
                                    {TripDetails?.trip_type || "Acting Driver Trip"}
                                </Text>
                                <Text style={styles.tripSubText}>
                                    Verified & Professional Driver at your pickup location
                                </Text>
                            </View>
                        </View>

                        {/* 2. Section: Contact & Pickup Details */}
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Pickup & Contact Details</Text>
                        </View>

                        <View style={styles.card}>
                            {/* Full Name */}
                            <View style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, errData.name && styles.labelError]}>
                                    Full Name <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <View style={[styles.inputBox, errData.name && styles.inputError]}>
                                    <Ionicons name="person-outline" size={18} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#94a3b8"
                                        value={name}
                                        onChangeText={(text) => {
                                            setName(text);
                                            if (text) clearError("name");
                                        }}
                                    />
                                </View>
                                {errData.name && (
                                    <Text style={styles.errorText}>Please enter your name</Text>
                                )}
                            </View>

                            {/* Mobile Number */}
                            <View style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, errData.mobileNumber && styles.labelError]}>
                                    Mobile Number <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <View style={[styles.inputBox, errData.mobileNumber && styles.inputError]}>
                                    <View style={styles.countryCodeBadge}>
                                        <Text style={styles.countryCodeText}>+91</Text>
                                    </View>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="10-digit mobile number"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                        maxLength={10}
                                        value={mobileNumber}
                                        onChangeText={(text) => {
                                            const cleaned = text.replace(/[^0-9]/g, "");
                                            setMobileNumber(cleaned);
                                            if (cleaned.length === 10) clearError("mobileNumber");
                                        }}
                                    />
                                </View>
                                {errData.mobileNumber && (
                                    <Text style={styles.errorText}>Enter valid 10-digit mobile number</Text>
                                )}
                            </View>

                            {/* Address Input */}
                            <View style={styles.fieldGroupNoBorder}>
                                <View style={styles.labelWithActionRow}>
                                    <Text style={[styles.fieldLabel, errData.address && styles.labelError]}>
                                        Pickup Address <Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("Googlemaps")}
                                        style={styles.changeLocationBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="map-outline" size={14} color={COLORS.primary} />
                                        <Text style={styles.changeLocationText}>Change on Map</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.addressInputBox, errData.address && styles.inputError]}>
                                    <Ionicons
                                        name="location-outline"
                                        size={20}
                                        color={COLORS.primary}
                                        style={styles.addressIcon}
                                    />
                                    <TextInput
                                        style={styles.addressTextInput}
                                        placeholder="Search or enter pickup address"
                                        placeholderTextColor="#94a3b8"
                                        multiline
                                        value={address}
                                        onChangeText={handleAddressChange}
                                    />
                                </View>
                                {errData.address ? (
                                    <Text style={styles.errorText}>Please enter pickup address</Text>
                                ) : (
                                    <Text style={styles.fieldHelperText}>
                                        Driver will navigate to this exact address
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* 3. Section: Trip Schedule & Preferences */}
                        <View style={styles.sectionHeader}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Schedule & Preferences</Text>
                        </View>

                        <View style={styles.card}>
                            {/* Journey Date & Time */}
                            <View style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, errData.startDate && styles.labelError]}>
                                    Journey Date & Time <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={showStartDatePicker}
                                    style={[styles.selectorBox, errData.startDate && styles.inputError]}
                                >
                                    <View style={styles.selectorLeftRow}>
                                        <View style={styles.selectorIconWrap}>
                                            <Ionicons name="calendar" size={18} color={COLORS.primary} />
                                        </View>
                                        <Text style={startDate ? styles.selectorValueActive : styles.selectorPlaceholder}>
                                            {formatJourneyDate(startDate)}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                                </TouchableOpacity>
                                {errData.startDate && (
                                    <Text style={styles.errorText}>Please select journey date and time</Text>
                                )}
                                <DateTimePicker
                                    isVisible={isStartDatePickerVisible}
                                    mode="datetime"
                                    onConfirm={handleStartDateConfirm}
                                    onCancel={hideStartDatePicker}
                                    minimumDate={new Date()}
                                />
                            </View>

                            {/* Select Hours (Duration) */}
                            <View style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, errData.hours && styles.labelError]}>
                                    Trip Duration <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setIsHoursDropdownVisible(true)}
                                    style={[styles.selectorBox, errData.hours && styles.inputError]}
                                >
                                    <View style={styles.selectorLeftRow}>
                                        <View style={styles.selectorIconWrap}>
                                            <Ionicons name="time" size={18} color={COLORS.primary} />
                                        </View>
                                        <Text style={hours ? styles.selectorValueActive : styles.selectorPlaceholder}>
                                            {hours ? `${Number(hours)} Hours Trip` : "Select Duration"}
                                        </Text>
                                    </View>
                                    <View style={styles.selectorArrowBadge}>
                                        <Ionicons name="chevron-down" size={16} color="#64748b" />
                                    </View>
                                </TouchableOpacity>
                                {errData.hours && (
                                    <Text style={styles.errorText}>Please choose trip duration</Text>
                                )}
                            </View>

                            {/* Gear Type Selector */}
                            <View style={styles.fieldGroupNoBorder}>
                                <Text style={[styles.fieldLabel, errData.gearType && styles.labelError]}>
                                    Vehicle Transmission / Gear Type <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <View style={styles.gearChipsContainer}>
                                    {gearTypeData?.map((item: any) => {
                                        const isSelected = gearType === item;
                                        return (
                                            <TouchableOpacity
                                                key={`gear_${item}`}
                                                activeOpacity={0.8}
                                                style={[styles.gearChip, isSelected && styles.gearChipActive]}
                                                onPress={() => {
                                                    setGearType(item);
                                                    clearError("gearType");
                                                }}
                                            >
                                                <Ionicons
                                                    name="speedometer-outline"
                                                    size={16}
                                                    color={isSelected ? COLORS.primary : "#64748b"}
                                                    style={{ marginRight: 6 }}
                                                />
                                                <Text style={[styles.gearChipText, isSelected && styles.gearChipTextActive]}>
                                                    {item}
                                                </Text>
                                                {isSelected && (
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={16}
                                                        color={COLORS.primary}
                                                        style={{ marginLeft: 6 }}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                {errData.gearType && (
                                    <Text style={styles.errorText}>Please select gear type</Text>
                                )}
                            </View>
                        </View>

                        {/* Extra padding at bottom for sticky action button */}
                        <View style={{ height: 90 }} />
                    </ScrollView>

                    {/* Bottom Action Footer */}
                    <View style={styles.bottomFooterBar}>
                        <View style={styles.footerInfoWrapper}>
                            <Text style={styles.footerDurationLabel}>Selected Duration</Text>
                            <Text style={styles.footerDurationValue}>
                                {hours ? `${Number(hours)} Hours` : "--"}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={goTOContinue}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.continueButtonText}>Continue to Fare</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    </View>

                    {/* Hours Selection Modal */}
                    <Modal
                        visible={isHoursDropdownVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setIsHoursDropdownVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setIsHoursDropdownVisible(false)}>
                            <View style={styles.modalBackdrop}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalCard}>
                                        <View style={styles.modalHeaderRow}>
                                            <View>
                                                <Text style={styles.modalTitle}>Select Trip Duration</Text>
                                                <Text style={styles.modalSubtitle}>Choose required driving hours</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => setIsHoursDropdownVisible(false)}
                                                style={styles.modalCloseBtn}
                                            >
                                                <Ionicons name="close" size={20} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>

                                        <FlatList
                                            data={tripData}
                                            keyExtractor={(item: any) => item.id.toString()}
                                            renderItem={({ item }: any) => {
                                                const selected = Number(hours) === Number(item.hours);
                                                return (
                                                    <TouchableOpacity
                                                        activeOpacity={0.7}
                                                        onPress={() => {
                                                            setHours(Number(item.hours));
                                                            clearError("hours");
                                                            setIsHoursDropdownVisible(false);
                                                        }}
                                                        style={[styles.hoursOptionRow, selected && styles.hoursOptionSelected]}
                                                    >
                                                        <View style={styles.hoursOptionLeft}>
                                                            <View style={[styles.hoursRadioOuter, selected && styles.hoursRadioOuterActive]}>
                                                                {selected && <View style={styles.hoursRadioInner} />}
                                                            </View>
                                                            <Text style={[styles.hoursOptionText, selected && styles.hoursOptionTextActive]}>
                                                                {Number(item.hours)} Hours Trip
                                                            </Text>
                                                        </View>
                                                        {item.total_amount ? (
                                                            <View style={styles.hoursPriceBadge}>
                                                                <Text style={styles.hoursPriceText}>₹{item.total_amount}</Text>
                                                            </View>
                                                        ) : null}
                                                    </TouchableOpacity>
                                                );
                                            }}
                                            ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                                            style={{ maxHeight: 320 }}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    {/* Fare Summary & Booking Confirmation Modal */}
                    <ModalBooking
                        isVisible={isVisible}
                        hours={hours}
                        setIsVisible={setIsVisible}
                        setEstimateAmount={setEstimateAmount}
                        handleBooking={handleBooking}
                        TripDetails={selectedTrip}
                    />
                </SafeAreaView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default BookingScreen;

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    headerWrapper: {
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.primary,
    },
    loaderOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
    },

    // 1. Trip Banner
    tripBannerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    tripIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    tripBannerTextWrapper: {
        flex: 1,
    },
    tripBadgeRow: {
        flexDirection: "row",
        marginBottom: 3,
    },
    tripBadge: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tripBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    tripTitleText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 2,
    },
    tripSubText: {
        fontSize: 12,
        color: "#64748b",
    },

    // Section Titles
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        marginTop: 4,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1e293b",
        marginLeft: 6,
        letterSpacing: 0.2,
    },

    // Card Container
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },

    // Field Groups
    fieldGroup: {
        marginBottom: 14,
    },
    fieldGroupNoBorder: {
        marginBottom: 4,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 6,
    },
    labelError: {
        color: "#ef4444",
    },
    requiredStar: {
        color: "#ef4444",
    },
    labelWithActionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    changeLocationBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
        paddingHorizontal: 6,
        backgroundColor: "#fee2e2",
        borderRadius: 6,
    },
    changeLocationText: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.primary,
        marginLeft: 3,
    },

    // Input Boxes
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 10,
        height: 48,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    countryCodeBadge: {
        paddingRight: 8,
        marginRight: 8,
        borderRightWidth: 1,
        borderRightColor: "#cbd5e1",
        justifyContent: "center",
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1e293b",
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: "#0f172a",
        fontWeight: "500",
        paddingVertical: 0,
    },
    addressInputBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 64,
    },
    addressIcon: {
        marginTop: 2,
        marginRight: 8,
    },
    addressTextInput: {
        flex: 1,
        fontSize: 13,
        color: "#0f172a",
        fontWeight: "500",
        lineHeight: 18,
        paddingVertical: 0,
        textAlignVertical: "top",
    },
    inputError: {
        borderColor: "#ef4444",
        backgroundColor: "#fff5f5",
    },
    errorText: {
        fontSize: 11,
        color: "#ef4444",
        marginTop: 4,
        marginLeft: 2,
        fontWeight: "500",
    },
    fieldHelperText: {
        fontSize: 11,
        color: "#94a3b8",
        marginTop: 4,
        marginLeft: 2,
    },

    // Selector Boxes (Date & Hours)
    selectorBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 10,
        height: 48,
        paddingHorizontal: 12,
    },
    selectorLeftRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    selectorIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    selectorPlaceholder: {
        fontSize: 13,
        color: "#94a3b8",
        fontWeight: "500",
    },
    selectorValueActive: {
        fontSize: 14,
        color: "#0f172a",
        fontWeight: "600",
    },
    selectorArrowBadge: {
        padding: 4,
    },

    // Gear Chips
    gearChipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    gearChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 10,
        marginRight: 10,
        marginBottom: 6,
    },
    gearChipActive: {
        backgroundColor: "#fff1f2",
        borderColor: COLORS.primary,
    },
    gearChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#475569",
    },
    gearChipTextActive: {
        color: COLORS.primary,
        fontWeight: "700",
    },

    // Sticky Bottom Footer Bar
    bottomFooterBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffffff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 8,
    },
    footerInfoWrapper: {
        flex: 1,
    },
    footerDurationLabel: {
        fontSize: 11,
        color: "#64748b",
        fontWeight: "500",
    },
    footerDurationValue: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0f172a",
    },
    continueButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 13,
        paddingHorizontal: 22,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    continueButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#ffffff",
    },

    // Hours Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalCard: {
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#0f172a",
    },
    modalSubtitle: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 2,
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalSeparator: {
        height: 1,
        backgroundColor: "#f8fafc",
    },
    hoursOptionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    hoursOptionSelected: {
        backgroundColor: "#fff1f2",
    },
    hoursOptionLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    hoursRadioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#cbd5e1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    hoursRadioOuterActive: {
        borderColor: COLORS.primary,
    },
    hoursRadioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    hoursOptionText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#1e293b",
    },
    hoursOptionTextActive: {
        fontWeight: "700",
        color: COLORS.primary,
    },
    hoursPriceBadge: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    hoursPriceText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0f172a",
    },
});
