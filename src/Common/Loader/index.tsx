import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../../utils/ColorCode";

const Loader = () => {
    return (
        <View style={styles.overlay}>
            <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        zIndex: 99999,
        elevation: 99999,
        flex:1
    },
    spinnerContainer: {
        width: 72,
        height: 72,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
});

export default Loader;
