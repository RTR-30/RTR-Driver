import React, { useEffect } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar
} from "react-native";
// import { useSelector } from "react-redux";
// import { RootState } from "./redux/store";
import { useNavigation } from "@react-navigation/native";

const InitialPage = () => {
    const navigation =useNavigation();
    // const user = useSelector((state: RootState) => state.user);
    
   useEffect(()=>{
    navigation.navigate("Onboard");
   },[])
}

export default InitialPage;