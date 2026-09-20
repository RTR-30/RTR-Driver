import React from "react";
import {
    View,
    Text,
    ActivityIndicator,
} from "react-native";

const Loader = () => {

    return (
        <View style={{justifyContent: "center",alignItems: "center",backgroundColor: "rgba(0,0,0,0.5)", width:'100%', height: '100%', zIndex:999}}>
            <View style={{justifyContent:'center', alignItems:'center', backgroundColor:'white', borderRadius:50}}>
                <ActivityIndicator size="large" color="#6200EE" />
            </View>
        </View>
    );
};

export default Loader;
