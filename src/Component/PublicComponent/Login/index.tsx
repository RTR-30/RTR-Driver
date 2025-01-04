import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView
} from "react-native";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import { FetchLogin } from "./helper";
import Loader from "../../../Common/Loader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";

const LoginImg = require('../../../../assets/Image/CarLogin.png');

const Login = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [showLoader, setShowLoader] = useState<boolean>(false);

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [passwordVisible, setPasswordVisible] = useState(false);

    const [errEmail, setErrEmail] = useState<boolean>(false);
    const [errPassword, setErrPassword] = useState<boolean>(false);

    const checkCondition = () => {
        if (!email || !password) {
            setErrEmail(!email);
            setErrPassword(!password)
        } else {
            handleLogin();
        }
    }

    const handleLogin = async () => {
        setShowLoader(true);

        const formData: any = {
            "email": email,
            "password": password
        }

        try {
            const response = await FetchLogin(formData);
            if (response.status === 200) {
                const userData: any = {
                    name: response.data.name,
                    email: response.data.email,
                    phoneNumber: response.data.phoneNumber,
                    id: response.data.id
                }
                console.log('====================================');
                console.log(userData);
                console.log('====================================');
                await AsyncStorage.setItem("UserData",JSON.stringify(userData))

                navigation.navigate("OwnerHome");
                setEmail("");
                setPassword("");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setShowLoader(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor={"#5a639c"} barStyle={"dark-content"} />

            {
                showLoader && (
                    <View style={{ position: 'absolute', height: '100%', width: '100%' }}>
                        <Loader />
                    </View>
                )
            }
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>

                <View style={{ width: '100%', height: '50%', backgroundColor: '#fff' }}>
                    <Image
                        source={LoginImg}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                    />
                </View>

                <View style={{ flex: 1, width: '100%', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', bottom: 30 }}>Login</Text>
                    <View style={{ width: '90%', backgroundColor: '#ffffff', padding: 5, marginTop: '5%' }}>
                        <View style={{ padding: 5, backgroundColor: '#ffffff' }}>
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 10 }}>
                                <FontAwesome name="user" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                                <TextInput
                                    style={{ color: 'black', width: '90%' }}
                                    placeholder="Enter email id"
                                    placeholderTextColor={"gray"}
                                    onChangeText={(txt: any) => {
                                        setEmail(txt);
                                        setErrEmail(!txt)
                                    }}
                                />
                            </View>
                            {errEmail && <Text style={{ color: "red", fontWeight: "400", }}>mail is required</Text>}
                        </View>

                        <View style={{ padding: 5, backgroundColor: '#ffffff', marginTop: '5%' }}>
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 10 }}>
                                <FontAwesome name="lock" size={20} color={"black"} style={{ alignSelf: 'center' }} />
                                <TextInput
                                    style={{ color: 'black', width: '80%' }}
                                    placeholder="Enter password"
                                    placeholderTextColor={"gray"}
                                    secureTextEntry={passwordVisible}
                                    onChangeText={(txt: any) => {
                                        setPassword(txt);
                                        setErrPassword(!txt);
                                    }}
                                />
                                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={{ width: '10%' }}>
                                    <FontAwesome name={passwordVisible ? "eye" : "eye-slash"} size={20} color="black" />
                                </TouchableOpacity>
                            </View>
                            {errPassword && <Text style={{ color: "red", fontWeight: '400' }}>password is required</Text>}
                        </View>
                    </View>

                    <View style={{ marginTop: 20, width: '90%', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={checkCondition}
                            style={{ width: '50%', height: 40, backgroundColor: '#9400FF', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Login</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>Don't have a account ? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                            <Text style={{ color: '#5a639c', fontSize: 16, fontWeight: '700' }}>Creare Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default Login;