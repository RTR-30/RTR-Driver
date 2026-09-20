import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    ActivityIndicator,
    Platform,
} from "react-native";

import DeviceInfo from "react-native-device-info";
import { COLORS } from "../../utils/ColorCode";

interface ForceUpdateProps {
    latestVersion?: string;
}

const ANDROID_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.driveforu";

const IOS_STORE_URL =
    "https://apps.apple.com/app/YOUR_APP_ID";

const compareVersions = (
    current: string,
    latest: string
) => {
    const currentParts = current
        .split(".")
        .map(Number);

    const latestParts = latest
        .split(".")
        .map(Number);

    const length = Math.max(
        currentParts.length,
        latestParts.length
    );

    for (let i = 0; i < length; i++) {

        const currentValue =
            currentParts[i] || 0;

        const latestValue =
            latestParts[i] || 0;

        if (currentValue < latestValue) {
            return -1;
        }

        if (currentValue > latestValue) {
            return 1;
        }
    }

    return 0;
};

const ForceUpdate = ({
    latestVersion,
}: ForceUpdateProps) => {

    const [loading, setLoading] = useState(true);
    const [forceUpdate, setForceUpdate] = useState(false);

    useEffect(() => {
        checkVersion();
    }, [latestVersion]);

    const checkVersion = () => {
        try {
            if (!latestVersion) {
                setForceUpdate(false);
                setLoading(false);
                return;
            }
            // Installed app version
            const currentVersion = DeviceInfo.getVersion();
            const isOldVersion = compareVersions(currentVersion, latestVersion) < 0;
            setForceUpdate(isOldVersion);

        } catch (error) {

            console.log(
                "Version check error:",
                error
            );

            setForceUpdate(false);

        } finally {
            setLoading(false);
        }
    };

    const openStore = async () => {

        const storeUrl =
            Platform.OS === "android"
                ? ANDROID_STORE_URL
                : IOS_STORE_URL;

        try {
            await Linking.openURL(storeUrl);
        } catch (error) {
            console.log(
                "Unable to open store:",
                error
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!forceUpdate) {
        return null;
    }

    return (
        <View style={styles.container}>

            <View style={styles.card}>

                <Text style={styles.icon}>
                    🚀
                </Text>

                <Text style={styles.title}>
                    Update Required
                </Text>

                <Text style={styles.message}>
                    A new version of the app is available.
                    {"\n\n"}
                    Please update the app to continue
                    using it.
                </Text>

                <Text style={styles.version}>
                    Current Version:{" "}
                    {DeviceInfo.getVersion()}
                </Text>

                <Text style={styles.version}>
                    Latest Version:{" "}
                    {latestVersion}
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={openStore}
                >
                    <Text style={styles.buttonText}>
                        Update Now
                    </Text>
                </TouchableOpacity>

            </View>

        </View>
    );
};

const styles = StyleSheet.create({

    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },

    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 9999,
        elevation: 9999,
    },

    card: {
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },

    icon: {
        fontSize: 55,
        marginBottom: 20,
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#111",
        marginBottom: 15,
    },

    message: {
        fontSize: 16,
        lineHeight: 24,
        color: "#666",
        textAlign: "center",
        marginBottom: 25,
        textAlignVertical: "center",
    },

    version: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },

    button: {
        width: "100%",
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },

    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
    },

});

export default ForceUpdate;