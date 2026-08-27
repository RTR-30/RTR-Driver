import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Linking,
    ToastAndroid
} from "react-native";
import Header from "../../../../Common/Header/index";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../../../utils/ColorCode";
import { showError } from "../../../../Common/ToastMessage";

const ContactUs = () => {
    const value = "Contact_Us";

    const randomNumber = (contectMethod: any) => {
        let call: string[] = ["6374335982", "8124301328", "9080734527"];

        if (contectMethod === "call") {
            let randomCall = call[Math.floor(Math.random() * call.length)];
            makeCall(randomCall);
        } else {
            let randomCall = call[Math.floor(Math.random() * call.length)];
            openWhatsApp(randomCall);
        }
    };


    const makeCall = (phoneNumber: any) => {
        const url = `tel:${phoneNumber}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    showError('Phone call not supported on this device');
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const openWhatsApp = (phoneNumber: any) => {
        let url = `whatsapp://send?phone=${phoneNumber}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    showError("WhatsApp is not installed on this device");
                }
            })
            .catch((err) => console.error("An error occurred", err));
    };

    const sendEmail = (email:any) => {
        let url = `mailto:${email}`;
    
        Linking.canOpenURL(url)
          .then((supported) => {
            if (supported) {
              Linking.openURL(url);
            } else {
              showError("No email app installed");
            }
          })
          .catch((err) => console.error("An error occurred", err));
      };

    return (
        <View className="flex-1" style={{backgroundColor:COLORS.primary}}>
            <View className="flex-1" style={{backgroundColor:COLORS.primary}}>
                <Header value={value} />
            </View>

            <View className="flex-[9] bg-white rounded-t-[30px] p-4">
                <ScrollView className="bg-white" showsVerticalScrollIndicator={false}>
                    <View className="mt-1">
                        <Text className="text-black font-bold text-[14px]">Thank you for choosing <Text className="text-blue-600 font-bold text-[14px]">RTR Driver!</Text>, your trusted ride-booking platform! Whether you're a passenger looking for a reliable ride or a driver ready to earn, we are here to make your journey smooth, safe, and hassle-free.</Text>
                        <Text className="text-black font-bold text-[14px] mt-2">Enjoy fast bookings, real-time tracking, secure payments, and 24/7 support—all at your fingertips!</Text>
                        <Text className="text-black font-medium text-[14px] mt-4 italic">"Need assistance? Our support team is here to help! You can contact us via phone or email or whatsapp for any queries related to bookings, payments, refunds, or technical support. Our team is available during working hours to ensure a smooth experience for both drivers and customers. Feel free to reach out!"</Text>
                    </View>

                    <View className="w-full justify-center items-center mt-28">
                        <Text className="text-black font-bold text-[18px]">Contact Details</Text>
                        <View className="w-full justify-around flex-row mt-9">
                            <View className="w-[30%] justify-center items-center">
                                <TouchableOpacity className="justify-center items-center" onPress={() => randomNumber("call")}>
                                    <Ionicons name="call-outline" color={"black"} size={40} />
                                </TouchableOpacity>
                            </View>

                            <View className="w-[30%] justify-center items-center">
                                <TouchableOpacity className="justify-center items-center" onPress={() => randomNumber("whatsapp")}>
                                    <Ionicons name="logo-whatsapp" color={"black"} size={40} />
                                </TouchableOpacity>
                            </View>

                            <View className="w-[30%] justify-center items-center">
                                <TouchableOpacity className="justify-center items-center" onPress={() => sendEmail("rtrdriver30@gmail.com")}>
                                    <Ionicons name="mail-outline" color={"black"} size={40} />
                                </TouchableOpacity>
                            </View>


                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

export default ContactUs;