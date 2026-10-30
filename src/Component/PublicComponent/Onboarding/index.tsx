/// <reference types="nativewind/types" />
import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
    FlatList,
    useWindowDimensions,
    Platform,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../../utils/ColorCode";
import { appLogo } from "../../../Common/Images";

// Importing onboard illustrations
const Screen1 = require("../../../../assets/Image/OnboardImage/Screen1.png");
const Screen2 = require("../../../../assets/Image/OnboardImage/Screen2.png");
const Screen3 = require("../../../../assets/Image/OnboardImage/Screen3.png");
const Screen4 = require("../../../../assets/Image/OnboardImage/Screen4.png");

interface OnboardSlide {
    id: string;
    badge: string;
    badgeIcon: string;
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    subtitle: string;
    image: any;
    features: { icon: string; text: string }[];
}

const SLIDES: OnboardSlide[] = [
    {
        id: "slide_1",
        badge: "WELCOME TO RTR DRIVER",
        badgeIcon: "sparkles",
        titlePrefix: "Your Trusted ",
        titleHighlight: "Personal Driver",
        titleSuffix: " Service",
        subtitle:
            "Hire verified, professional chauffeurs to drive your own car safely and comfortably for daily commutes and city travel.",
        image: Screen1,
        features: [
            { icon: "shield-checkmark-outline", text: "Vetted Drivers" },
            { icon: "car-outline", text: "Your Own Car" },
            { icon: "time-outline", text: "24/7 Available" },
        ],
    },
    {
        id: "slide_2",
        badge: "FLEXIBLE PACKAGES",
        badgeIcon: "options-outline",
        titlePrefix: "Custom Rides ",
        titleHighlight: "Tailored to You",
        titleSuffix: "",
        subtitle:
            "Choose from flexible hourly city packages or multi-day outstation road trips with transparent upfront rates and zero hidden fees.",
        image: Screen2,
        features: [
            { icon: "hourglass-outline", text: "Hourly Bookings" },
            { icon: "map-outline", text: "Outstation Trips" },
            { icon: "pricetag-outline", text: "Best Pricing" },
        ],
    },
    {
        id: "slide_3",
        badge: "SAFETY & TRUST FIRST",
        badgeIcon: "shield-half-outline",
        titlePrefix: "Ride with Complete ",
        titleHighlight: "Peace of Mind",
        titleSuffix: "",
        subtitle:
            "Stay protected with live GPS tracking, strict background checks, cashless digital billing, and dedicated 24/7 assistance.",
        image: Screen3,
        features: [
            { icon: "navigate-outline", text: "Live Tracking" },
            { icon: "card-outline", text: "Secure Payments" },
            { icon: "call-outline", text: "Emergency SOS" },
        ],
    },
    {
        id: "slide_4",
        badge: "READY TO ROLL",
        badgeIcon: "rocket-outline",
        titlePrefix: "Sit Back, Relax & ",
        titleHighlight: "Enjoy The Ride",
        titleSuffix: "",
        subtitle:
            "Turn tiring traffic into relaxing downtime or family memories. Your dedicated personal driver is just a tap away.",
        image: Screen4,
        features: [
            { icon: "flash-outline", text: "Instant Booking" },
            { icon: "happy-outline", text: "Stress-Free" },
            { icon: "star-outline", text: "Top Rated" },
        ],
    },
];

const OnboardingScreen: React.FC = () => {
    const navigation: any = useNavigation();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const flatListRef = useRef<FlatList<OnboardSlide>>(null);

    const isLastSlide = currentIndex === SLIDES.length - 1;
    const illustrationHeight = Math.min(screenHeight * 0.35, 290);

    const goToSlide = (index: number) => {
        if (index >= 0 && index < SLIDES.length) {
            flatListRef.current?.scrollToIndex({ index, animated: true });
            setCurrentIndex(index);
        }
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            goToSlide(currentIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        }
    };

    const handleComplete = () => {
        navigation.navigate("Login");
    };

    const handleMomentumScrollEnd = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / screenWidth);
        if (newIndex >= 0 && newIndex < SLIDES.length && newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }
    };

    const renderSlide = ({ item }: { item: OnboardSlide }) => {
        return (
            <View
                style={{ width: screenWidth }}
                className="flex-1 justify-between px-6"
            >
                {/* Visual Hero Illustration Container */}
                <View
                    style={{ height: illustrationHeight }}
                    className="w-full items-center justify-center relative mt-1"
                >
                    {/* Soft ambient decorative rings */}
                    <View
                        className="absolute w-60 h-60 rounded-full bg-red-50/70"
                        style={styles.ambientGlow}
                    />
                    <View
                        className="absolute w-72 h-72 rounded-full border border-red-100/40"
                    />

                    {/* Illustration Asset */}
                    <Image
                        source={item.image}
                        style={{ width: "88%", height: "88%" }}
                        resizeMode="contain"
                    />
                </View>

                {/* Text & Content Section */}
                <View className="items-center pb-2">
                    {/* Badge Pill */}
                    <View className="flex-row items-center bg-red-50 border border-red-100/80 px-3.5 py-1.5 rounded-full mb-3">
                        <Ionicons
                            name={item.badgeIcon}
                            size={13}
                            color={COLORS.primary}
                            style={{ marginRight: 6 }}
                        />
                        <Text
                            className="text-[11px] font-black tracking-wider uppercase"
                            style={{ color: COLORS.primary }}
                        >
                            {item.badge}
                        </Text>
                    </View>

                    {/* Headline */}
                    <Text className="text-[23px] font-black text-slate-900 tracking-tight text-center leading-8 mb-2">
                        {item.titlePrefix}
                        <Text style={{ color: COLORS.primary }}>
                            {item.titleHighlight}
                        </Text>
                        {item.titleSuffix}
                    </Text>

                    {/* Subtitle Value Proposition */}
                    <Text className="text-[13.5px] text-slate-500 font-medium text-center leading-relaxed px-2 mb-4">
                        {item.subtitle}
                    </Text>

                    {/* Feature Highlight Chips */}
                    <View className="flex-row flex-wrap justify-center gap-2">
                        {item.features.map((feat, idx) => (
                            <View
                                key={idx}
                                className="flex-row items-center bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl"
                            >
                                <Ionicons
                                    name={feat.icon}
                                    size={13}
                                    color={COLORS.primary}
                                    style={{ marginRight: 5 }}
                                />
                                <Text className="text-[11px] font-bold text-slate-700">
                                    {feat.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }} edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Top Navigation Bar */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-1">
                {/* Brand Identity */}
                <View className="flex-row items-center bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
                    <Image
                        source={appLogo}
                        style={{ width: 20, height: 20, borderRadius: 5, marginRight: 7 }}
                        resizeMode="contain"
                    />
                    <Text className="text-[13px] font-black text-slate-800 tracking-tight">
                        R<Text style={{ color: COLORS.primary }}>T</Text>R Driver
                    </Text>
                </View>

                {/* Skip / Final Step Pill */}
                {!isLastSlide ? (
                    <TouchableOpacity
                        onPress={handleComplete}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="flex-row items-center bg-slate-100 px-3.5 py-1.5 rounded-full active:bg-slate-200"
                    >
                        <Text className="text-[12px] font-extrabold text-slate-600 mr-1">
                            Skip
                        </Text>
                        <Ionicons name="chevron-forward" size={13} color="#64748b" />
                    </TouchableOpacity>
                ) : (
                    <View className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
                        <Text
                            className="text-[11px] font-extrabold tracking-wider"
                            style={{ color: COLORS.primary }}
                        >
                            FINAL STEP
                        </Text>
                    </View>
                )}
            </View>

            {/* Swiper Carousel */}
            <View className="flex-1">
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    renderItem={renderSlide}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    getItemLayout={(_, index) => ({
                        length: screenWidth,
                        offset: screenWidth * index,
                        index,
                    })}
                />
            </View>

            {/* Bottom Actions & Pagination Controls */}
            <View className="px-6 pb-6 pt-2 bg-white">
                {/* Dynamic Expanding Pill Pagination */}
                <View className="flex-row justify-center items-center py-3 mb-2">
                    {SLIDES.map((_, index) => {
                        const isActive = currentIndex === index;
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                onPress={() => goToSlide(index)}
                                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                                style={[
                                    styles.dot,
                                    isActive ? styles.activeDot : styles.inactiveDot,
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Action Buttons */}
                {!isLastSlide ? (
                    <View className="flex-row items-center">
                        {currentIndex > 0 && (
                            <TouchableOpacity
                                onPress={handlePrev}
                                activeOpacity={0.8}
                                className="w-13 h-13 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center mr-3"
                                style={styles.iconButton}
                            >
                                <Ionicons name="arrow-back" size={20} color="#334155" />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={handleNext}
                            activeOpacity={0.85}
                            style={[styles.primaryButton, { backgroundColor: COLORS.primary }]}
                            className="flex-1 h-13 rounded-2xl flex-row items-center justify-center"
                        >
                            <Text className="text-white text-[15px] font-extrabold mr-2">
                                Next Step
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="w-full">
                        {/* Get Started Main Action */}
                        <TouchableOpacity
                            onPress={handleComplete}
                            activeOpacity={0.85}
                            style={[styles.primaryButton, { backgroundColor: COLORS.primary }]}
                            className="w-full h-14 rounded-2xl flex-row items-center justify-center mb-3"
                        >
                            <Text className="text-white text-[16px] font-black mr-2">
                                Get Started Now
                            </Text>
                            <Ionicons name="arrow-forward" size={19} color="#ffffff" />
                        </TouchableOpacity>

                        {/* Sign In Link */}
                        <View className="flex-row justify-center items-center">
                            <Text className="text-[13px] text-slate-500 font-medium">
                                Already have an account?{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("Login")}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className="text-[13px] font-extrabold"
                                    style={{ color: COLORS.primary }}
                                >
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    ambientGlow: {
        opacity: 0.85,
    },
    dot: {
        height: 7,
        borderRadius: 4,
        marginHorizontal: 3.5,
    },
    activeDot: {
        width: 26,
        backgroundColor: COLORS.primary,
    },
    inactiveDot: {
        width: 7,
        backgroundColor: "#E2E8F0",
    },
    iconButton: {
        width: 50,
        height: 52,
    },
    primaryButton: {
        height: 52,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
});

export default OnboardingScreen;
