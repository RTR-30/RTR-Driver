import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Dimensions,
    TextInput,
    Image
} from "react-native";
import { fetchSignUp } from "./helper";
import Loader from "../../../Common/Loader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
const SignUpImg = require("../../../../assets/Image/SignUp.png")

const SignUp = () => {
    const navigation = useNavigation();

    const [value, setValue] = useState<any>(null);
    const [showLoader, setShowLoader] = useState<boolean>(false);

    const data = [
        { label: "Acting Driver", value: "1" },
        { label: "Car Owner", value: "2" },
    ];

    const [errName, setErrName] = useState(false);
    const [errEmail, setErrEmail] = useState(false);
    const [errPassword, setErrPassword] = useState(false);
    const [errConfirmPassword, setErrConfirmPassword] = useState(false);
    const [errMobileNo, setErrMobileNo] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mobileNo, setMobileNo] = useState("");

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const checkCondition = () => {

        if (!name || !email || !password || !confirmPassword || !mobileNo) {
            setErrName(!name);
            setErrEmail(!email);
            setErrPassword(!password);
            setErrConfirmPassword(!confirmPassword);
            setErrMobileNo(!mobileNo);
        } else {
            if (password === confirmPassword) {
                handleSignUp();
            } else {
                Alert.alert("password")
            }
        }
        4
    };

    const handleSignUp = async () => {
        setShowLoader(true);
        const field = "Car Owner"
        const formData = new FormData();
        
        formData.append("name",name);
        formData.append("email",email);
        formData.append("password",password);
        formData.append("phoneNumber",mobileNo);
        formData.append("field",field);

        try {
            const response = await fetchSignUp(formData)
            if (response.status === 200) {
                setName("");
                setEmail("");
                setMobileNo("");
                setPassword("");

                navigation.navigate("Login");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setShowLoader(false);
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#5a639c" }}>
            <StatusBar backgroundColor="#5a639c" barStyle="dark-content" />

            {
                showLoader && (
                    <View style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'absolute', zIndex: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <View style={{ height: '10%', width: '10%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                            <Loader />
                        </View>
                    </View>
                )
            }

            <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                <Image
                    source={SignUpImg}
                    style={{ width: '100%', height: '100%' }}
                />
            </View>

            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <View style={{ width: "97%", justifyContent: "center", alignItems: "center", shadowColor: "black", elevation: 5, backgroundColor: "#ffffff", borderRadius: 20, height: 500, padding: '5%' }}>
                    <Text style={{ color: "black", fontSize: 20, fontWeight: "bold", marginBottom: 10, }}>Create Account</Text>

                    <View style={{ width: "99%", marginVertical: 5, marginTop: '5%', height: '10%' }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 10 }}>
                            <FontAwesome name="user" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '90%' }}
                                placeholder="Enter name"
                                placeholderTextColor="gray"
                                onChangeText={(txt) => {
                                    setName(txt);
                                    setErrName(!txt);
                                }}
                            />
                        </View>
                        {errName && <Text style={{ color: "red", fontWeight: "400", }}>Name is required</Text>}
                    </View>

                    <View style={{ width: "99%", marginVertical: 5, marginTop: '5%', height: '10%' }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 10 }}>
                            <MaterialIcons name="email" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '90%' }}
                                placeholder="Enter email id"
                                placeholderTextColor="gray"
                                onChangeText={(txt) => {
                                    setEmail(txt);
                                    setErrEmail(!txt);
                                }}
                            />
                        </View>
                        {errEmail && <Text style={{ color: "red", fontWeight: "400" }}>Email is required</Text>}
                    </View>

                    <View style={{ width: "99%", marginVertical: 5, marginTop: '5%', height: '10%' }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 10 }}>
                            <MaterialIcons name="phone" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '90%' }}
                                placeholder="Enter mobile number"
                                placeholderTextColor="gray"
                                onChangeText={(txt) => {
                                    setMobileNo(txt);
                                    setErrMobileNo(!txt);
                                }}
                            />
                        </View>
                        {errMobileNo && <Text style={{ color: "red", fontWeight: "400", }}>Mobile number is required</Text>}
                    </View>

                    <View style={{ width: "99%", marginVertical: 5, marginTop: '5%', height: '10%' }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 10 }}>
                            <View style={{ alignItems: 'center', width: '10%', justifyContent: 'center', height: '100%' }}>
                                <FontAwesome name="lock" size={20} color={"black"} />
                            </View>
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '80%' }}
                                placeholder="Enter password"
                                placeholderTextColor="gray"
                                secureTextEntry={!passwordVisible}
                                onChangeText={(txt) => {
                                    setPassword(txt);
                                    setErrPassword(!txt);
                                }}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={{ width: '10%' }}>
                                <FontAwesome name={passwordVisible ? "eye" : "eye-slash"} size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                        {errPassword && <Text style={{ color: "red", fontWeight: "400", }}>Password is required</Text>}
                    </View>

                    <View style={{ width: "99%", marginVertical: 5, marginTop: '5%', height: '10%' }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderRadius: 10 }}>
                            <View style={{ alignItems: 'center', width: '10%', justifyContent: 'center', height: '100%' }}>
                                <FontAwesome name="lock" size={20} color={"black"} />
                            </View>
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '80%' }}
                                placeholder="Confirm password"
                                placeholderTextColor="gray"
                                secureTextEntry
                                onChangeText={(txt) => {
                                    setConfirmPassword(txt);
                                    setErrConfirmPassword(!txt);
                                }}
                            />
                            <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={{ width: '10%' }}>
                                <FontAwesome name={passwordVisible ? "eye" : "eye-slash"} size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                        {errConfirmPassword && <Text style={{ color: "red", fontWeight: "400", }}>Confirm Password is required</Text>}
                    </View>

                    <View style={{ marginTop: 20, width: "100%", justifyContent: "center", alignItems: "center", }}>
                        <TouchableOpacity onPress={checkCondition} style={{ width: 150, height: 40, backgroundColor: "#9400FF", justifyContent: "center", alignItems: "center", borderRadius: 10, }}>
                            <Text style={{ color: "white", fontWeight: "900", fontSize: 18, }}>Submit</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', marginTop: '5%' }}>
                            <Text style={{ color: 'black', fontSize: 14, fontWeight: '600' }}>Already have an account?</Text>
                            <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => navigation.navigate("Login")}>
                                <Text style={{ color: '#5a639c', fontSize: 14, fontWeight: '600' }}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SignUp;
