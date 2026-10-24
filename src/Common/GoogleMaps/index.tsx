import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Keyboard,
    Text,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Alert,
    TextInput,
    FlatList,
    BackHandler,
    StatusBar,
} from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, requestMultiple, RESULTS, openSettings } from 'react-native-permissions';
import { Google_Key } from '../../../environment/ApiManager';
import { COLORS } from '../../utils/ColorCode';
import { showSuccess, showError } from '../ToastMessage';
import Header from '../Header';

const GOOGLE_API_KEY = Google_Key;

type Coordinate = {
    latitude: number;
    longitude: number;
};

const DEFAULT_COORDINATE: Coordinate = {
    latitude: 13.0827,
    longitude: 80.2707,
};

const DEFAULT_REGION: Region = {
    ...DEFAULT_COORDINATE,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
};

export default function Googlemaps() {
    const navigation: any = useNavigation();
    const route: any = useRoute();
    const mapRef = useRef<MapView>(null);

    // View state: false = "Select a location" screen (Porter style), true = Google Map screen
    const [showMap, setShowMap] = useState(false);

    // Current GPS location state
    const [currentAddress, setCurrentAddress] = useState('');
    const [currentCoordinate, setCurrentCoordinate] = useState<Coordinate | null>(null);
    const [isLocatingCurrent, setIsLocatingCurrent] = useState(false);

    // Selected location & Map state
    const [coordinate, setCoordinate] = useState<Coordinate>(DEFAULT_COORDINATE);
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);
    const [address, setAddress] = useState('');
    const [searchText, setSearchText] = useState('');
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isFetchingPredictions, setIsFetchingPredictions] = useState(false);
    const [isLocatingMap, setIsLocatingMap] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [isMovingMap, setIsMovingMap] = useState(false);

    const searchTimeoutRef = useRef<any>(null);
    const regionChangeTimeoutRef = useRef<any>(null);

    // Handle Android hardware back button
    useEffect(() => {
        const backAction = () => {
            if (showMap) {
                Keyboard.dismiss();
                setShowMap(false);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [showMap]);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            if (regionChangeTimeoutRef.current) clearTimeout(regionChangeTimeoutRef.current);
        };
    }, []);

    // Request location permission
    const requestLocationPermission = async (): Promise<boolean> => {
        try {
            if (Platform.OS === 'android') {
                const statuses = await requestMultiple([
                    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
                ]);
                const granted =
                    statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED ||
                    statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED;

                if (!granted) {
                    Alert.alert(
                        'Location Permission Required',
                        'Please allow location access to find your current pickup location.',
                        [
                            { text: 'Open Settings', onPress: () => { openSettings(); } },
                            { text: 'Cancel', style: 'cancel' }
                        ]
                    );
                }
                return granted;
            } else {
                const statuses = await requestMultiple([
                    PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
                ]);
                const granted = statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE] === RESULTS.GRANTED;
                if (!granted) {
                    Alert.alert(
                        'Location Permission Required',
                        'Please allow location access to find your current pickup location.',
                        [
                            { text: 'Open Settings', onPress: () => { openSettings(); } },
                            { text: 'Cancel', style: 'cancel' }
                        ]
                    );
                }
                return granted;
            }
        } catch (error) {
            console.warn('Permission error:', error);
            return false;
        }
    };

    // Reverse geocode latitude and longitude to readable address using Google Places API (New)
    const resolveAddress = async (latitude: number, longitude: number): Promise<string> => {
        try {
            const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress',
                },
                body: JSON.stringify({
                    locationRestriction: {
                        circle: {
                            center: { latitude, longitude },
                            radius: 100.0,
                        },
                    },
                }),
            });

            const data = await response.json();
            if (data?.places && data.places.length > 0) {
                const place = data.places[0];
                const resolved = place.formattedAddress || place.displayName?.text;
                if (resolved) {
                    return resolved;
                }
            }
        } catch (err) {
            console.warn('Google reverse geocode error:', err);
        }

        return `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
    };

    // Reverse geocode map coordinate and update address input & bottom card
    const reverseGeocodeMap = async (latitude: number, longitude: number) => {
        setIsReverseGeocoding(true);
        try {
            const resolved = await resolveAddress(latitude, longitude);
            setAddress(resolved);
            setSearchText(resolved);
        } catch (error) {
            console.warn('reverseGeocodeMap error:', error);
        } finally {
            setIsReverseGeocoding(false);
        }
    };

    // Fetch device GPS current location
    const fetchCurrentLocation = async (navigateOnSuccess = false) => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        setIsLocatingCurrent(true);

        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const newCoordinate: Coordinate = { latitude, longitude };
                const newRegion: Region = {
                    ...newCoordinate,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                };

                setCurrentCoordinate(newCoordinate);
                setCoordinate(newCoordinate);
                setRegion(newRegion);

                try {
                    const resolved = await resolveAddress(latitude, longitude);
                    setCurrentAddress(resolved);
                    setAddress(resolved);
                    setSearchText(resolved);

                    if (navigateOnSuccess) {
                        navigateToTrip(resolved, newCoordinate);
                    }
                } catch (error) {
                    const fallback = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
                    setCurrentAddress(fallback);
                    setAddress(fallback);
                    setSearchText(fallback);

                    if (navigateOnSuccess) {
                        navigateToTrip(fallback, newCoordinate);
                    }
                } finally {
                    setIsLocatingCurrent(false);
                }
            },
            (error) => {
                setIsLocatingCurrent(false);
                console.warn('Geolocation error:', error);
                if (navigateOnSuccess) {
                    showError('Could not fetch current GPS location. Please check device location settings.');
                }
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    // Auto-fetch GPS on initial screen load
    useEffect(() => {
        fetchCurrentLocation(false);
    }, []);

    // Animate map camera to location when showMap becomes true
    useEffect(() => {
        if (showMap) {
            const initialCoord = currentCoordinate || coordinate;
            const initialReg: Region = {
                ...initialCoord,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
            };
            setCoordinate(initialCoord);
            setRegion(initialReg);

            const timer = setTimeout(() => {
                mapRef.current?.animateToRegion(initialReg, 500);
                if (!address) {
                    reverseGeocodeMap(initialCoord.latitude, initialCoord.longitude);
                } else {
                    setSearchText(address);
                }
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [showMap]);

    // Navigate to Trip screen or call parent callback
    const navigateToTrip = (
        selectedAddress: string,
        selectedCoordinate: Coordinate
    ) => {
        if (route?.params?.onSelectLocation) {
            route.params.onSelectLocation({
                address: selectedAddress,
                coordinate: selectedCoordinate,
            });
            navigation.goBack();
        } else if (route?.params?.onSelectAddress) {
            route.params.onSelectAddress(selectedAddress, selectedCoordinate);
            navigation.goBack();
        } else {
            showSuccess('Pickup location selected successfully!');
            navigation.navigate('Trip', {
                address: selectedAddress,
                coordinate: selectedCoordinate,
            });
        }
    };

    // User tapped "Use current location" on Screen 1
    const handleUseCurrentLocation = async () => {
        if (currentAddress && currentCoordinate) {
            navigateToTrip(currentAddress, currentCoordinate);
        } else {
            await fetchCurrentLocation(true);
        }
    };

    // User tapped "Select Address" on Screen 1
    const handleSelectAddress = () => {
        setShowMap(true);
    };

    // Map region change in progress (user is actively panning/zooming)
    const handleRegionChange = () => {
        if (!isMovingMap) {
            setIsMovingMap(true);
        }
    };

    // Map region change completed: Pin sets the new location
    const handleRegionChangeComplete = (reg: Region) => {
        setIsMovingMap(false);

        const newCoordinate: Coordinate = {
            latitude: reg.latitude,
            longitude: reg.longitude,
        };

        setCoordinate(newCoordinate);
        setRegion(reg);

        if (regionChangeTimeoutRef.current) {
            clearTimeout(regionChangeTimeoutRef.current);
        }

        regionChangeTimeoutRef.current = setTimeout(async () => {
            await reverseGeocodeMap(newCoordinate.latitude, newCoordinate.longitude);
        }, 400);
    };

    // User taps anywhere on the map: moves camera to center the tapped location under the pin
    const handleMapPress = (event: any) => {
        Keyboard.dismiss();
        setPredictions([]);

        const tappedCoord = event.nativeEvent?.coordinate;
        if (!tappedCoord) return;

        setCoordinate(tappedCoord);

        const newReg: Region = {
            ...tappedCoord,
            latitudeDelta: region.latitudeDelta || 0.008,
            longitudeDelta: region.longitudeDelta || 0.008,
        };

        setRegion(newReg);
        mapRef.current?.animateToRegion(newReg, 450);
        reverseGeocodeMap(tappedCoord.latitude, tappedCoord.longitude);
    };

    // Map locate button: animates camera to user's device GPS location
    const handleMapLocate = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        setIsLocatingMap(true);
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const newCoordinate: Coordinate = { latitude, longitude };
                const newRegion: Region = {
                    ...newCoordinate,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                };

                setCoordinate(newCoordinate);
                setRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 800);
                setIsLocatingMap(false);

                await reverseGeocodeMap(latitude, longitude);
            },
            (error) => {
                setIsLocatingMap(false);
                console.warn('Geolocation error:', error);
                showError('Could not fetch current GPS location.');
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    // Google Places API (New) Autocomplete search
    const handleSearchTextChange = (text: string) => {
        setSearchText(text);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!text || text.trim().length < 2) {
            setPredictions([]);
            setIsFetchingPredictions(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsFetchingPredictions(true);
            try {
                const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': GOOGLE_API_KEY,
                        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text',
                    },
                    body: JSON.stringify({
                        input: text,
                        includedRegionCodes: ['in'],
                    }),
                });

                const data = await response.json();
                if (data?.suggestions && Array.isArray(data.suggestions)) {
                    setPredictions(data.suggestions);
                } else {
                    setPredictions([]);
                }
            } catch (err) {
                console.warn('Autocomplete fetch error:', err);
                setPredictions([]);
            } finally {
                setIsFetchingPredictions(false);
            }
        }, 350);
    };

    // User selects a suggestion from Google Places Autocomplete
    const handleSelectPrediction = async (item: any) => {
        Keyboard.dismiss();
        setPredictions([]);

        const placeId = item?.placePrediction?.placeId;
        const placeText = item?.placePrediction?.text?.text || '';

        setAddress(placeText);
        setSearchText(placeText);

        if (!placeId) {
            return;
        }

        try {
            const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
                method: 'GET',
                headers: {
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
                },
            });
            const placeData = await resp.json();

            const lat = placeData?.location?.latitude;
            const lng = placeData?.location?.longitude;

            if (typeof lat === 'number' && typeof lng === 'number') {
                const newCoordinate: Coordinate = { latitude: lat, longitude: lng };
                const newRegion: Region = {
                    ...newCoordinate,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                };

                setCoordinate(newCoordinate);
                setRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 800);

                if (placeData?.formattedAddress) {
                    setAddress(placeData.formattedAddress);
                    setSearchText(placeData.formattedAddress);
                }
            } else {
                showError('Could not retrieve coordinates for this location.');
            }
        } catch (err) {
            console.warn('Place details fetch error:', err);
            showError('Could not fetch location details.');
        }
    };

    // Confirm pickup location and proceed
    const handleConfirmLocation = () => {
        if (!address.trim() && !coordinate.latitude) {
            showError('Please search or select a pickup address.');
            return;
        }
        Keyboard.dismiss();
        navigateToTrip(address, coordinate);
    };

    // ==========================================
    // 1. SELECT LOCATION SCREEN (PORTER STYLE)
    // ==========================================
    if (!showMap) {
        return (
            <View style={styles.screenContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

                {/* Header */}
                <View style={styles.headerWrapper}>
                    <Header value="Select a location" />
                </View>

                {/* Main Content Sheet */}
                <View style={styles.contentSheet}>
                    <View style={styles.cardContainer}>
                        {/* Option 1: Use Current Location */}
                        <TouchableOpacity
                            style={styles.cardRow}
                            onPress={handleUseCurrentLocation}
                            activeOpacity={0.7}
                            disabled={isLocatingCurrent}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="locate" size={22} color={COLORS.primary} />
                            </View>

                            <View style={styles.cardTextWrapper}>
                                <Text style={styles.cardTitle}>Use current location</Text>
                                {isLocatingCurrent ? (
                                    <View style={styles.detectingRow}>
                                        <ActivityIndicator
                                            size="small"
                                            color={COLORS.primary}
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text style={styles.cardSubText}>Detecting current location...</Text>
                                    </View>
                                ) : currentAddress ? (
                                    <Text style={styles.cardSubText} numberOfLines={2}>
                                        {currentAddress}
                                    </Text>
                                ) : (
                                    <Text style={styles.cardSubTextPlaceholder}>
                                        Tap to detect your GPS location
                                    </Text>
                                )}
                            </View>

                            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.cardDivider} />

                        {/* Option 2: Select Address on Google Map */}
                        <TouchableOpacity
                            style={styles.cardRow}
                            onPress={handleSelectAddress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="location" size={22} color={COLORS.primary} />
                            </View>

                            <View style={styles.cardTextWrapper}>
                                <Text style={styles.cardTitle}>Select Address</Text>
                                <Text style={styles.cardSubText} numberOfLines={1}>
                                    Choose pickup location on Google Map
                                </Text>
                            </View>

                            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // ==========================================
    // 2. INTERACTIVE GOOGLE MAP SCREEN
    // ==========================================
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Map View */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={region}
                onPress={handleMapPress}
                onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation={true}
                showsMyLocationButton={false}
            />

            {/* Fixed Center Pin Marker (Porter / Uber style) */}
            <View style={styles.centerPinWrapper} pointerEvents="none">
                <View style={[styles.centerPinContainer, isMovingMap && styles.centerPinLifting]}>
                    <View style={styles.centerPinBadge}>
                        <Text style={styles.centerPinBadgeText} numberOfLines={1}>
                            {isMovingMap ? 'Move map to adjust' : 'Pickup Location'}
                        </Text>
                    </View>
                    <Ionicons name="location" size={42} color={COLORS.primary} />
                    <View style={styles.centerPinShadow} />
                </View>
            </View>

            {/* Top Floating Places (New) Autocomplete Search */}
            <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
                <View style={styles.searchHeaderRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            Keyboard.dismiss();
                            setShowMap(false);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>

                    <View style={styles.autocompleteWrapper}>
                        <View style={styles.searchBarContainer}>
                            <View style={styles.searchIconContainer}>
                                <Ionicons name="search" size={20} color={COLORS.primary} />
                            </View>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search address..."
                                placeholderTextColor="#94a3b8"
                                value={searchText}
                                onChangeText={handleSearchTextChange}
                                returnKeyType="search"
                                autoCorrect={false}
                            />
                            {isFetchingPredictions ? (
                                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 6 }} />
                            ) : searchText.length > 0 ? (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => {
                                        setSearchText('');
                                        setPredictions([]);
                                    }}
                                >
                                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Search Suggestions Dropdown */}
                        {predictions.length > 0 && (
                            <View style={styles.listView}>
                                <FlatList
                                    data={predictions}
                                    keyExtractor={(item, index) => item?.placePrediction?.placeId || index.toString()}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => {
                                        const fullText = item?.placePrediction?.text?.text || '';
                                        const firstComma = fullText.indexOf(',');
                                        const mainText = firstComma > -1 ? fullText.slice(0, firstComma).trim() : fullText;
                                        const subText = firstComma > -1 ? fullText.slice(firstComma + 1).trim() : '';

                                        return (
                                            <TouchableOpacity
                                                style={styles.rowContainer}
                                                onPress={() => handleSelectPrediction(item)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons
                                                    name="location-outline"
                                                    size={22}
                                                    color={COLORS.primary}
                                                    style={styles.rowIcon}
                                                />
                                                <View style={styles.rowTextContainer}>
                                                    <Text style={styles.rowMainText} numberOfLines={1}>
                                                        {mainText}
                                                    </Text>
                                                    {subText ? (
                                                        <Text style={styles.rowSubText} numberOfLines={1}>
                                                            {subText}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </SafeAreaView>

            {/* Floating Current Location Button */}
            <TouchableOpacity
                style={styles.locateButton}
                onPress={handleMapLocate}
                disabled={isLocatingMap}
                activeOpacity={0.8}
            >
                {isLocatingMap ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Ionicons name="locate" size={26} color={COLORS.primary} />
                )}
            </TouchableOpacity>

            {/* Bottom Card for Location Confirmation */}
            <SafeAreaView edges={['bottom']} style={styles.bottomOverlay} pointerEvents="box-none">
                <View style={styles.bottomCard}>
                    <View style={styles.bottomCardContent}>
                        <View style={styles.pinBadge}>
                            <Ionicons name="location" size={24} color="#fff" />
                        </View>
                        <View style={styles.bottomTextWrapper}>
                            <Text style={styles.addressTitle}>Selected Pickup Location</Text>
                            {isReverseGeocoding ? (
                                <View style={styles.loadingAddressRow}>
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                    <Text style={styles.loadingAddressText}>Fetching address...</Text>
                                </View>
                            ) : (
                                <Text style={styles.addressText} numberOfLines={2}>
                                    {address || 'Move map or search to set pickup location'}
                                </Text>
                            )}
                            <Text style={styles.coordinates}>
                                Lat: {coordinate.latitude.toFixed(5)} | Lng: {coordinate.longitude.toFixed(5)}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirmLocation}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.confirmButtonText}>Confirm Pickup Location</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Screen container for "Select a location"
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    headerWrapper: {
        height: 60,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
    },
    contentSheet: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 16,
        overflow: 'hidden',
    },
    cardContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardTextWrapper: {
        flex: 1,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 3,
    },
    cardSubText: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },
    cardSubTextPlaceholder: {
        fontSize: 13,
        color: '#94a3b8',
    },
    detectingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginHorizontal: 16,
    },

    // Map Screen Styles
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },

    // Fixed Center Marker Pin Styles (Porter / Uber style)
    centerPinWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    centerPinContainer: {
        alignItems: 'center',
        marginBottom: 42,
    },
    centerPinLifting: {
        transform: [{ translateY: -10 }],
    },
    centerPinBadge: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
    },
    centerPinBadgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    centerPinShadow: {
        width: 10,
        height: 6,
        borderRadius: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        marginTop: -3,
    },

    // Top Floating Search Bar
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        elevation: 10,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    searchHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    autocompleteWrapper: {
        flex: 1,
        zIndex: 1000,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 24,
        height: 48,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
        backgroundColor: 'transparent',
        paddingVertical: 0,
        paddingHorizontal: 8,
        marginBottom: 0,
    },
    searchIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    clearButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listView: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginTop: 8,
        maxHeight: 260,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    rowIcon: {
        marginRight: 10,
    },
    rowTextContainer: {
        flex: 1,
    },
    rowMainText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    rowSubText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },

    // Floating Current Location Button
    locateButton: {
        position: 'absolute',
        right: 16,
        bottom: 210,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
        zIndex: 50,
    },

    // Bottom Confirmation Card
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
    },
    bottomCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 10,
    },
    bottomCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    pinBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    bottomTextWrapper: {
        flex: 1,
    },
    addressTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 3,
    },
    addressText: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },
    loadingAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    loadingAddressText: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 6,
    },
    coordinates: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 4,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});