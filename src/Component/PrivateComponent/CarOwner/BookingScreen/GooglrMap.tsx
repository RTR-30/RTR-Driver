import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    Modal,
    StyleSheet,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Geolocation from "react-native-geolocation-service";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
    openSettings,
    PERMISSIONS,
    requestMultiple,
    RESULTS,
} from "react-native-permissions";

/* ================= CUSTOM MAP THEME ================= */

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },

    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#2c2c2c" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#a0a0a0" }],
    },

    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0f252e" }],
    },

    {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
    },
];

/* ================= TYPES ================= */

export type GoogleMapViewProps = {
    handleCurrentLocation?: any;
    setAddress?: (address: string) => void;
    address?: string;
};

/* ================= COMPONENT ================= */

const GoogleMaps = ({
    handleCurrentLocation = () => {},
    setAddress = () => {},
    address = "",
}: GoogleMapViewProps) => {
    const mapRef = useRef<MapView>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const defaultRegion = {
        latitude: 10.8505,
        longitude: 78.7006,
        latitudeDelta: 5,
        longitudeDelta: 5,
    };

    /* ================= PERMISSION ================= */

    const requestLocationPermission = async () => {
        const statuses = await requestMultiple([
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
            PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        ]);

        const granted = Object.values(statuses).every(
            status => status === RESULTS.GRANTED
        );

        if (!granted) {
            Alert.alert(
                "Permission Required",
                "Please allow location access",
                [{ text: "Open Settings", onPress: openSettings }]
            );
        }

        return granted;
    };

    /* ================= REVERSE GEOCODE (FREE) ================= */

    const getAddress = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                    headers: {
                        "User-Agent": "Drive4U/1.0 (support@drive4u.in)",
                    },
                }
            );

            const data = await response.json();
            if (data?.display_name) {
                setAddress(data.display_name);
            }
            else{
                setAddress("murari")
            }
        } catch {
            setAddress("Unable to fetch address");
        }
    };

    /* ================= CURRENT LOCATION ================= */

    const fetchCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;
        
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
        
                const location = {
                    latitude,
                    longitude,
                };
        
                setCurrentLocation(location);
                handleCurrentLocation(location);
        
                getAddress(latitude, longitude);
        
                mapRef.current?.animateToRegion({
                    ...location,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                });
            },
            error => {
                console.log("GEOLOCATION ERROR:", error);
        
                Alert.alert(
                    "Location Error",
                    `${error.message}\n\nError Code: ${error.code}`
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 10000,
                forceRequestLocation: true,
                showLocationDialog: true,
            }
        );
    };

    /* ================= MAP PRESS ================= */

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const location = { latitude, longitude };

        setCurrentLocation(location);
        handleCurrentLocation(location);
        getAddress(latitude, longitude);

        mapRef.current?.animateToRegion({
            ...location,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
        });
    };

    /* ================= AUTO LOAD ================= */

    useEffect(() => {
        fetchCurrentLocation();
    }, []);

    /* ================= MAP VIEW ================= */

    const renderMap = (height = 220) => (
        <View>
            <MapView
                provider={PROVIDER_GOOGLE}
                ref={mapRef}
                style={{ height }}
                initialRegion={defaultRegion}
                // customMapStyle={darkMapStyle}
                showsBuildings
                zoomEnabled
                onPress={handleMapPress}
            >
                {currentLocation && (
                    <Marker coordinate={currentLocation} />
                )}
            </MapView>

            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setIsFullscreen(true)}
            />
        </View>
    );

    return (
        <View>
            {renderMap()}

            {/* ================= FULLSCREEN ================= */}
            <Modal visible={isFullscreen} animationType="slide">
                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setIsFullscreen(false)}
                >
                    <Ionicons name="close-outline" size={26} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.locateBtn}
                    onPress={fetchCurrentLocation}
                >
                    <Ionicons name="locate-outline" size={26} color="#fff" />
                </TouchableOpacity>

                <MapView
                    provider={PROVIDER_GOOGLE}
                    ref={mapRef}
                    style={{ flex: 1 }}
                    initialRegion={defaultRegion}
                    customMapStyle={darkMapStyle}
                    showsBuildings
                    onPress={handleMapPress}
                >
                    {currentLocation && (
                        <Marker coordinate={currentLocation} />
                    )}
                </MapView>
            </Modal>

            {/* ================= ADDRESS ================= */}
            <View style={styles.addressRow}>
                <Text numberOfLines={2} style={styles.addressText}>
                    {address || "Tap map or location icon"}
                </Text>

                <TouchableOpacity onPress={fetchCurrentLocation}>
                    <Ionicons
                        name="locate-outline"
                        size={24}
                        color="#36a3fb"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default GoogleMaps;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    closeBtn: {
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 10,
        backgroundColor: "#000",
        padding: 8,
        borderRadius: 22,
    },
    locateBtn: {
        position: "absolute",
        top: 100,
        right: 20,
        zIndex: 10,
        backgroundColor: "#000",
        padding: 8,
        borderRadius: 22,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#fff",
    },
    addressText: {
        color: "#000",
        width: "88%",
    },
});
