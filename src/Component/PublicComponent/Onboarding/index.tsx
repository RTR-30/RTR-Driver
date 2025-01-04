import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from "react-native";

import Onboarding from "react-native-onboarding-swiper";

// Importing images
const Welcome = require("../../../../assets/Image/OnboardImage/Screen1.png");
const Feature = require("../../../../assets/Image/OnboardImage/Screen2.png");
const Privacy = require("../../../../assets/Image/OnboardImage/Screen4.png");

const OnboardingScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={{flex:1}}>
            <Onboarding onDone={()=>navigation.navigate("Login")} showSkip={false} titleStyles={{color:'black', fontWeight:'bold'}} subTitleStyles={{color:'black', fontWeight:'400'}}
                pages={[
                    {
                        backgroundColor: '#fff',
                        image: <Image source={Welcome} style={{ width: 400, height: 400 }} />, // Adjusting size of the image
                        title: 'Welcome to Drive4U',
                        subtitle: 'Let us show you how to get started!',
                    },
                    {
                        backgroundColor: '#fff',
                        image: <Image source={Feature} style={{ width: 400, height: 400 }} />, // Adjusting size of the image
                        title: 'Features or Benefits',
                        subtitle: 'Track your progress with customizable to-do lists and Access your data from any device.',
                    },
                    {
                        backgroundColor: '#fff',
                        image: <Image source={Privacy} style={{ width: 400, height: 400 }} />, // Adjusting size of the image
                        title: 'Start Your Journey',
                        subtitle: 'Explore and enjoy the app!',
                    },
                ]}
            />
        </View>
    );
};

export default OnboardingScreen;
