import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, TextInput, ToastAndroid } from "react-native";
import {
    Image,
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DocumentPicker, { types } from "react-native-document-picker";
import { FetchProfileUpdate, FetchUsers } from "./helper";
import Loader from "../../../../Common/Loader";


const NoImg = require("../../../../../assets/Image/NoImg.png");

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [user, setUser] = useState<any>([]);

    const [userData, setUserData] = useState<any[]>([]);

    const [profilePic, setProfilePic] = useState<any>(null);
    const [address, setAddress] = useState<any>(null);
    const [addressEdit, setAddressEdit] = useState<boolean>(false);

    console.log('====================================');
    console.log(userData);
    console.log('====================================');

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [types.images],
                allowMultiSelection: false,
            });
            setProfilePic(result[0]);

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log("Document picker canceled");
            } else {
                console.error("Error picking document:", err);
            }
        }
    };

    const fetchProfile = async () => {
        const userId = user.id;
        const formData = new FormData;
        if(profilePic){
            formData.append("profilePic", {
                uri: profilePic.uri,
                name: profilePic.name,
                type: profilePic.type,
            });
        }
        formData.append("address", address);
        
        try {
            const response = await FetchProfileUpdate(userId, formData);
            if (response.status === 200) {
                setAddressEdit(false)
                ToastAndroid.show(response.data, ToastAndroid.SHORT);
                fetchUserData();
            }
        } catch (error) {
            console.log("profile update ",error);
        }
    }
    
    const fetchUserData = async () => {
        try {
            const storedUserData:any = await AsyncStorage.getItem("UserData");
            console.log('====================================');
            console.log("stored Data",storedUserData);
            console.log('====================================');
            setUser(JSON.parse(storedUserData));
            // fetchUserData();
            
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };


    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(()=>{
        const fetchUserDetails = async () => {
            if(user){
                setShowLoading(true);
                const userId = user.id;

                try {
                    const response = await FetchUsers(userId);
                    setUserData(response.data);
                } catch (error: any) {
                    console.log("user details",error);
                } finally {
                    setShowLoading(false)
                }
            }
        }

        fetchUserDetails();
    },[user])

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {
                showLoading && (
                    <View style={{ position: 'absolute', height: '100%', width: '100%', zIndex: 10 }}>
                        <Loader />
                    </View>
                )
            }

            <View style={{ flex: 1 }}>
                <View style={{ height: '100%', width: '100%' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10, marginTop: 10, position: 'absolute' }}>
                        <Ionicons name="arrow-back" size={30} color={"black"} />
                    </TouchableOpacity>

                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ height: '50%', width: '30%', backgroundColor: '#ffffff', borderRadius: 60, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={userData.profilePic ? { uri: `data:image/jpeg;base64,${userData.profilePic}` } : profilePic ? { uri: profilePic.uri } : NoImg}
                                style={{ height: '100%', width: '100%', borderRadius: 100 }}
                                resizeMode="cover"
                            />
                            <TouchableOpacity onPress={pickDocument} style={{ marginLeft: "80%", bottom: "30%", backgroundColor: '#5a639c', height: 30, width: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 30 }}>
                                <Entypo name="edit" color={"white"} size={20} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: '5%' }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 20 }}>{user.name}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={{ flex: 2, backgroundColor: '#fff', borderTopWidth: 1, borderColor: 'black', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ backgroundColor: '#fff', width: '100%', padding: 20 }}>
                        <View style={{ marginTop: 10, padding: 10, flexDirection: 'row', width: '100%' }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, width: '20%' }}>Id</Text>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16, width: '80%' }}>:  RTR-00{user.id}</Text>
                        </View>

                        <View style={{ marginTop: 10, padding: 10, flexDirection: 'row', width: '100%' }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, width: '20%' }}>Email</Text>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16, width: '80%' }}>:  {user.email}</Text>
                        </View>

                        <View style={{ marginTop: 10, padding: 10, flexDirection: 'row', width: '100%' }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, width: '20%' }}>Mob No</Text>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16, width: '80%' }}>:  {user.phoneNumber}</Text>
                        </View>

                        <View style={{ marginTop: 10, padding: 10, width: '100%' }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18 }}>Address :-</Text>
                            <View style={{ width: '100%', flexDirection: 'row' }}>
                                {
                                    !addressEdit ? (
                                        <View style={{ width: '100%', flexDirection: 'row', marginTop:10 }}>
                                            <View style={{ width: '90%' }}>
                                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16, width: '70%' }}>{userData.address}</Text>
                                            </View>

                                            <View style={{ width: '10%' }}>
                                                <TouchableOpacity onPress={() => setAddressEdit(true)}>
                                                    <FontAwesome5 name="edit" size={20} color={"black"} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <TextInput
                                            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, color: "#000", width: '100%', textAlignVertical: 'top', height: 100 }}
                                            placeholder="Enter Address"
                                            placeholderTextColor="gray"
                                            multiline={true}
                                            numberOfLines={4}
                                            onChangeText={(txt) => {
                                                setAddress(txt);
                                            }}
                                        />
                                    )
                                }
                            </View>
                        </View>
                    </View>

                    <View style={{ flex: 1, alignItems: "center" }}>
                        <TouchableOpacity onPress={fetchProfile}>
                            <View style={{ backgroundColor: "#5a639c", padding: 15, borderRadius: 10, width: 150, alignItems: "center" }}>
                                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Update</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default ProfileScreen;