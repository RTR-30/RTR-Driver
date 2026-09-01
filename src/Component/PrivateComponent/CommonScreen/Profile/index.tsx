import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  TextInput,
  ToastAndroid,
  StatusBar,
  Image,
  View,
  Text,
  TouchableOpacity
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateingUser } from "./helper";
import Loader from "../../../../Common/Loader";
import AvatarPickerModal, { defaultImg } from "./Avatar";
import { COLORS } from "../../../../utils/ColorCode";
import Header from "../../../../Common/Header";
import CustomImagePicker from "../../../../Common/ImagePicker";
import { showError, showSuccess } from "../../../../Common/ToastMessage";

const profilebg = require("../../../../../assets/Image/Profilebg.png");
const NoImg = require("../../../../../assets/Image/EtyImg.png");

const ProfileScreen = () => {
  const navigation = useNavigation();
  const value = "My Profile";
  const backNavigate = true;

  const [token, setToken] = useState<any>(null);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    phno: '',
    address: '',
    img: ''
  });
  const [edit, setEdit] = useState<boolean>(false);

  const handleUpdate = async () => {
    setShowLoading(true);

    const payload = {
      Name: profile?.name,
      Email: profile?.email,
      MobileNo: profile?.phno,
      ProfilePic: profile?.img,
      Address: profile?.address
    }

    try {
      const res = await updateingUser(payload)
      const { data: { status = 0, message = '', user = {} } } = res
      if(status === 200){
        await AsyncStorage.setItem("UserData", JSON.stringify(user));
        closeEdit()
        showSuccess(message)
      }
    } catch (error) {
      showError(error);
    } finally {
      setShowLoading(false);
    }
  };

  const openEdit = () => {
    setEdit(true)
  }

  const closeEdit = () => {
    setEdit(false)
  }

  const fetchUserData = async () => {
    try {
      const storedUserData: any = await AsyncStorage.getItem("UserData");

      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        setProfile({
          name: parsedUser?.Name,
          email: parsedUser?.Email,
          phno: parsedUser?.MobileNo,
          address: parsedUser?.Address,
          img: parsedUser?.ProfilePic
        }); // from backend
      }

    } catch (error) {
      showError(error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.primary }}>
      {showLoading && (
        <View style={{ position: 'absolute', height: '100%', width: '100%', zIndex: 10 }}>
          <Loader />
        </View>
      )}

      <View className="flex-1">
        <Header value={value} backNavigate={backNavigate} edit={true} clickEdit={openEdit} />
      </View>

      <View className="bg-[#cccccc] w-full h-full" style={{ flex: 9 }}>
        <View className="p-10 rounded-b-3xl" style={{ backgroundColor: COLORS.primary }}>
          <View className="absolute bg-white p-2 self-center items-center w-[100%] rounded-2xl mt-4 h-60">
            <View className="w-36 h-36 justify-center items-center mt-2" style={{ borderColor: COLORS.primary, borderWidth: 3, borderRadius: 20 }}>
              <Image
                source={
                  profile.img
                    ? { uri: profile.img }
                    : NoImg
                }
                resizeMode="cover"
                className="w-full h-full"
                style={{ borderRadius: 20 }}
              />
            </View>

            <View className="mt-3 flex-row justify-around w-full">
              <CustomImagePicker
                primaryColor={COLORS.primary}
                onImageSelect={(image) => {
                  setProfile({
                    ...profile,
                    img: image.path,
                  });
                }}
              />
            </View>
          </View>
        </View>

        <View className="mt-52 px-4">
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 200,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: COLORS.primary }}
              >
                Full Name
              </Text>

              <View
                className="bg-white rounded-2xl px-4"
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  elevation: 2,
                }}
              >
                <TextInput
                  value={profile.name}
                  onChangeText={(text) =>
                    setProfile({ ...profile, name: text })
                  }
                  placeholder="Enter Full Name"
                  className="text-base text-black py-4"
                  readOnly={!edit}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: COLORS.primary }}
              >
                Email Address
              </Text>

              <View
                className="bg-white rounded-2xl px-4"
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  elevation: 2,
                }}
              >
                <TextInput
                  value={profile.email}
                  onChangeText={(text) =>
                    setProfile({ ...profile, email: text })
                  }
                  keyboardType="email-address"
                  placeholder="Enter Email Address"
                  className="text-base text-black py-4"
                  readOnly={true}
                />
              </View>
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: COLORS.primary }}
              >
                Mobile Number
              </Text>

              <View
                className="bg-white rounded-2xl px-4"
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  elevation: 2,
                }}
              >
                <TextInput
                  value={profile.phno}
                  onChangeText={(text) =>
                    setProfile({ ...profile, phno: text })
                  }
                  keyboardType="phone-pad"
                  placeholder="Enter Mobile Number"
                  className="text-base text-black py-4"
                  readOnly={!edit}
                />
              </View>
            </View>

            {/* Address */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: COLORS.primary }}
              >
                Address
              </Text>

              <View
                className="bg-white rounded-2xl px-4"
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  elevation: 2,
                }}
              >
                <TextInput
                  value={profile.address}
                  onChangeText={(text) =>
                    setProfile({ ...profile, address: text })
                  }
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholder="Enter Address"
                  className="text-base text-black py-4"
                  readOnly={!edit}
                />
              </View>
            </View>

            {/* Update Button */}
            {edit ?
              <TouchableOpacity
                className="rounded-2xl py-4 mt-4"
                style={{ backgroundColor: COLORS.primary }}
                onPress={handleUpdate}
              >
                <Text className="text-center text-white text-base font-bold">
                  Update Profile
                </Text>
              </TouchableOpacity> : null
            }

          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default ProfileScreen;
