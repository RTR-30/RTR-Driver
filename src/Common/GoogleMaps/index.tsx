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
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
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

export default function Googlemaps() {
    const navigation: any = useNavigation();
    const route: any = useRoute();
    const mapRef = useRef<MapView>(null);

    // View state: false = "Select a location" screen (like Porter screenshot), true = Google Map screen
    const [showMap, setShowMap] = useState(false);

    // Current location state
    const [currentAddress, setCurrentAddress] = useState('');
    const [currentCoordinate, setCurrentCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLocatingCurrent, setIsLocatingCurrent] = useState(false);

    // Map screen state
    const [address, setAddress] = useState('');
    const [searchText, setSearchText] = useState('');
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isFetchingPredictions, setIsFetchingPredictions] = useState(false);
    const [isLocatingMap, setIsLocatingMap] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

    const [coordinate, setCoordinate] = useState({
        latitude: 13.0827,
        longitude: 80.2707,
    });

    const [region, setRegion] = useState<Region>({
        latitude: 13.0827,
        longitude: 80.2707,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    });

    const searchTimeoutRef = useRef<any>(null);
    const regionChangeTimeoutRef = useRef<any>(null);

    // Handle hardware back button when on map view
    useEffect(() => {
        const backAction = () => {
            if (showMap) {
                setShowMap(false);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [showMap]);

    // Request device location permission
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

    // Reverse geocode latitude and longitude to human-readable address
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

        // Fallback to OpenStreetMap Nominatim
        try {
            const nomRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                    headers: {
                        'User-Agent': 'Drive4U/1.0 (support@drive4u.in)',
                    },
                }
            );
            const nomData = await nomRes.json();
            if (nomData?.display_name) {
                return nomData.display_name;
            }
        } catch (nomErr) {
            console.warn('Nominatim reverse geocode error:', nomErr);
        }

        return `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
    };

    // Reverse geocode for map
    const reverseGeocodeMap = async (latitude: number, longitude: number) => {
        setIsReverseGeocoding(true);
        const resolved = await resolveAddress(latitude, longitude);
        setAddress(resolved);
        setSearchText(resolved);
        setIsReverseGeocoding(false);
    };

    // Fetch current GPS location
    const fetchCurrentLocation = async (navigateOnSuccess = false) => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        setIsLocatingCurrent(true);

        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const newCoordinate = { latitude, longitude };
                const newRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                };

                setCurrentCoordinate(newCoordinate);
                setCoordinate(newCoordinate);
                setRegion(newRegion);

                const resolved = await resolveAddress(latitude, longitude);
                setCurrentAddress(resolved);
                setAddress(resolved);
                setSearchText(resolved);
                setIsLocatingCurrent(false);

                if (navigateOnSuccess) {
                    navigateToTrip(resolved, newCoordinate);
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

    // Auto-fetch current location on screen mount
    useEffect(() => {
        fetchCurrentLocation(false);
    }, []);

    // Navigate to Trip screen or call parent callback
    const navigateToTrip = (selectedAddress: string, selectedCoordinate: { latitude: number; longitude: number }) => {
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

    // User tapped "Use current location"
    const handleUseCurrentLocation = async () => {
        if (currentAddress && currentCoordinate) {
            navigateToTrip(currentAddress, currentCoordinate);
        } else {
            await fetchCurrentLocation(true);
        }
    };

    // User tapped "Select Address"
    const handleSelectAddress = () => {
        setShowMap(true);
        if (currentCoordinate) {
            mapRef.current?.animateToRegion({
                ...currentCoordinate,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
            }, 500);
        }
    };

    // Handle region change complete on map
    const handleRegionChangeComplete = (reg: Region) => {
        const newCoordinate = {
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
        }, 500);
    };

    // Map locate button
    const handleMapLocate = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;

        setIsLocatingMap(true);
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const newCoordinate = { latitude, longitude };
                const newRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                };

                setCoordinate(newCoordinate);
                setRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 1000);
                setIsLocatingMap(false);

                await reverseGeocodeMap(latitude, longitude);
            },
            (error) => {
                setIsLocatingMap(false);
                console.warn('Geolocation error:', error);
                showError('Could not fetch current location');
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    // Handle search text change with Places API (New) Autocomplete
    const handleSearchTextChange = (text: string) => {
        setSearchText(text);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!text || text.trim().length < 2) {
            setPredictions([]);
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
                        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
                    },
                    body: JSON.stringify({
                        input: text,
                        includedRegionCodes: ['IN'],
                        languageCode: 'en',
                    }),
                });
                const data = await response.json();
                if (data?.suggestions) {
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
        }, 300);
    };

    // Handle place selected from autocomplete dropdown
    const handleSelectPrediction = async (predictionItem: any) => {
        Keyboard.dismiss();
        setPredictions([]);

        const placeId = predictionItem?.placeId || predictionItem?.placePrediction?.placeId || predictionItem?.id;
        const predictionText =
            predictionItem?.structuredFormat?.mainText?.text ||
            predictionItem?.placePrediction?.structuredFormat?.mainText?.text ||
            predictionItem?.text?.text ||
            predictionItem?.placePrediction?.text?.text ||
            '';

        if (predictionText) {
            setSearchText(predictionText);
            setAddress(predictionText);
        }

        if (!placeId) {
            showError('Selected place ID not found');
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

            if (lat !== undefined && lng !== undefined) {
                const newCoordinate = { latitude: lat, longitude: lng };
                const newRegion = {
                    ...newCoordinate,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                };
                setCoordinate(newCoordinate);
                setRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 1000);

                const resolvedAddress = placeData?.formattedAddress || placeData?.displayName?.text || predictionText;
                if (resolvedAddress) {
                    setAddress(resolvedAddress);
                    setSearchText(resolvedAddress);
                }
            } else {
                showError('Could not retrieve coordinates for this location');
            }
        } catch (err) {
            console.warn('Place details fetch error:', err);
            showError('Could not fetch location details');
        }
    };

    // Handle marker drag completion
    const handleMarkerDragEnd = async (event: any) => {
        const newCoordinate = event.nativeEvent.coordinate;
        setCoordinate(newCoordinate);
        setRegion({
            ...newCoordinate,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        });
        await reverseGeocodeMap(newCoordinate.latitude, newCoordinate.longitude);
    };

    // Handle tap on map
    const handleMapPress = async (event: any) => {
        Keyboard.dismiss();
        const tappedCoord = event.nativeEvent.coordinate;
        if (!tappedCoord) return;
        setCoordinate(tappedCoord);
        setRegion({
            ...tappedCoord,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        });
        await reverseGeocodeMap(tappedCoord.latitude, tappedCoord.longitude);
    };

    // Confirm pickup location on map
    const handleConfirmLocation = () => {
        if (!address && !coordinate.latitude) {
            showError('Please search or select a pickup address');
            return;
        }
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

                {/* Main Card with 2 Options */}
                <View style={styles.cardContainer}>
                    {/* Option 1: Use Current Location */}
                    <TouchableOpacity
                        style={styles.cardRow}
                        onPress={handleUseCurrentLocation}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="locate" size={22} color={COLORS.primary} />
                        </View>

                        <View style={styles.cardTextWrapper}>
                            <Text style={styles.cardTitle}>Use current location</Text>
                            {isLocatingCurrent ? (
                                <View style={styles.detectingRow}>
                                    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 6 }} />
                                    <Text style={styles.cardSubText}>Detecting current location...</Text>
                                </View>
                            ) : currentAddress ? (
                                <Text style={styles.cardSubText} numberOfLines={2}>
                                    {currentAddress}
                                </Text>
                            ) : (
                                <Text style={styles.cardSubTextPlaceholder}>
                                    Tap to detect and use your GPS location
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
    // 2. GOOGLE MAP INTERACTIVE SCREEN
    // ==========================================
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Map View */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                region={region}
                onPress={handleMapPress}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
                <Marker
                    key={`marker_${coordinate.latitude}_${coordinate.longitude}`}
                    coordinate={coordinate}
                    title="Pickup Location"
                    description={address || 'Drag marker or tap to adjust'}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                    tracksViewChanges={true}
                >
                    <View style={styles.markerContainer}>
                        <Ionicons name="location" size={32} color={COLORS.primary} />
                    </View>
                </Marker>
            </MapView>

            {/* Top Floating Search Bar */}
            <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
                <View style={styles.searchHeaderRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setShowMap(false)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>

                    <View style={styles.autocompleteWrapper}>
                        <View style={styles.textInputContainer}>
                            <View style={styles.searchIconContainer}>
                                <Ionicons name="search" size={20} color={COLORS.primary} />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Search pickup address..."
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

                        {predictions.length > 0 && (
                            <View style={styles.listView}>
                                <FlatList
                                    data={predictions}
                                    keyExtractor={(item, index) => item?.placePrediction?.placeId || item?.placeId || index.toString()}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => {
                                        const prediction = item?.placePrediction || item;
                                        const mainText = prediction?.structuredFormat?.mainText?.text || prediction?.text?.text || '';
                                        const secondaryText = prediction?.structuredFormat?.secondaryText?.text || '';
                                        return (
                                            <TouchableOpacity
                                                style={styles.rowContainer}
                                                onPress={() => handleSelectPrediction(prediction)}
                                            >
                                                <Ionicons
                                                    name="location-outline"
                                                    size={20}
                                                    color={COLORS.primary}
                                                    style={styles.rowIcon}
                                                />
                                                <View style={styles.rowTextContainer}>
                                                    <Text style={styles.rowMainText} numberOfLines={1}>
                                                        {mainText}
                                                    </Text>
                                                    {secondaryText ? (
                                                        <Text style={styles.rowSubText} numberOfLines={1}>
                                                            {secondaryText}
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
                                    {address || 'Search address or tap map to set location'}
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
    markerContainer: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    textInputContainer: {
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
    searchIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    clearButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
        backgroundColor: 'transparent',
        paddingVertical: 0,
        paddingHorizontal: 4,
        marginBottom: 0,
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
