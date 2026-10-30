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
    Modal,
    ScrollView,
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
import {
    getAddressesService,
    addAddressService,
    deleteAddressService,
    AddressPayload,
} from './helper';

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

    // Saved Addresses state (from /user/addresses)
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

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

    // Extracted address details for saving
    const [addressDetails, setAddressDetails] = useState({
        city: '',
        state: '',
        pincode: '',
        apartmentRoadArea: '',
    });

    // Save Address Modal Form state
    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [editableAddress, setEditableAddress] = useState('');
    const [tag, setTag] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
    const [houseFlatFloor, setHouseFlatFloor] = useState('');
    const [apartmentRoadArea, setApartmentRoadArea] = useState('');
    const [landmark, setLandmark] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [instructions, setInstructions] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    const searchTimeoutRef = useRef<any>(null);
    const regionChangeTimeoutRef = useRef<any>(null);

    // Handle Android hardware back button
    useEffect(() => {
        const backAction = () => {
            if (isSaveModalVisible) {
                setIsSaveModalVisible(false);
                return true;
            }
            if (showMap) {
                Keyboard.dismiss();
                setShowMap(false);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [showMap, isSaveModalVisible]);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            if (regionChangeTimeoutRef.current) clearTimeout(regionChangeTimeoutRef.current);
        };
    }, []);

    // Fetch saved addresses from backend GET /user/addresses
    const fetchSavedAddresses = async () => {
        setIsLoadingAddresses(true);
        try {
            const res: any = await getAddressesService();
            const data = res?.data?.data || res?.data?.addresses || res?.data;
            if (Array.isArray(data)) {
                setSavedAddresses(data);
            } else {
                setSavedAddresses([]);
            }
        } catch (error) {
            console.warn('Error fetching addresses:', error);
            setSavedAddresses([]);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    useEffect(() => {
        fetchSavedAddresses();
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
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.addressComponents',
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

                // Extract address components for saving
                let city = '';
                let state = '';
                let pincode = '';
                let area = '';

                if (Array.isArray(place.addressComponents)) {
                    place.addressComponents.forEach((comp: any) => {
                        const types = comp.types || [];
                        if (types.includes('locality')) {
                            city = comp.longText || comp.shortText || '';
                        }
                        if (types.includes('administrative_area_level_1')) {
                            state = comp.longText || comp.shortText || '';
                        }
                        if (types.includes('postal_code')) {
                            pincode = comp.longText || comp.shortText || '';
                        }
                        if (types.includes('sublocality_level_1') || types.includes('neighborhood') || types.includes('route')) {
                            if (!area) area = comp.longText || comp.shortText || '';
                        }
                    });
                }

                setAddressDetails({
                    city,
                    state,
                    pincode,
                    apartmentRoadArea: area,
                });

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
        await fetchCurrentLocation(true);
    };

    // User tapped "Select Address" on Screen 1
    const handleSelectAddress = () => {
        setShowMap(true);
    };

    // User taps a saved address from GET /user/addresses
    const handleSelectSavedAddress = (item: any) => {
        const fullAddress = item.formattedAddress || item.houseFlatFloor || 'Saved Address';
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            navigateToTrip(fullAddress, { latitude: lat, longitude: lng });
        } else {
            showError('Invalid coordinates in saved address.');
        }
    };

    // User deletes a saved address via DELETE /user/addresses/:id
    const handleDeleteSavedAddress = (id: string | number) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this saved address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res: any = await deleteAddressService(id);
                            if (res?.data?.status !== false) {
                                showSuccess('Address deleted successfully.');
                                fetchSavedAddresses();
                            } else {
                                showError(res?.data?.message || 'Failed to delete address.');
                            }
                        } catch (error) {
                            showError('Unable to delete address.');
                        }
                    },
                },
            ]
        );
    };

    // Open the Save Address Modal sheet
    const handleOpenSaveModal = () => {
        if (!address.trim()) {
            showError('Please select a pickup address first.');
            return;
        }
        setEditableAddress(address);
        setApartmentRoadArea(addressDetails.apartmentRoadArea || '');
        setIsSaveModalVisible(true);
    };

    // Submit new address using POST /user/addresses
    const handleSaveAddressSubmit = async () => {
        const finalAddress = (editableAddress || address).trim();
        if (!finalAddress || !coordinate.latitude) {
            showError('Invalid address or coordinates.');
            return;
        }

        if (!houseFlatFloor.trim()) {
            showError('Please enter House / Flat / Block No.');
            return;
        }

        setIsSavingAddress(true);
        try {
            const payload: AddressPayload = {
                tag: tag,
                formattedAddress: finalAddress,
                houseFlatFloor: houseFlatFloor.trim(),
                apartmentRoadArea: apartmentRoadArea.trim() || addressDetails.apartmentRoadArea || undefined,
                landmark: landmark.trim() || undefined,
                city: addressDetails.city || 'Bengaluru',
                state: addressDetails.state || 'Karnataka',
                pincode: addressDetails.pincode || undefined,
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                contactName: contactName.trim() || undefined,
                contactPhone: contactPhone.trim() || undefined,
                instructions: instructions.trim() || undefined,
                isDefault: isDefault,
            };

            const res: any = await addAddressService(payload);
            const { status = true, message = '' } = res?.data || {};
            
            if (status !== false) {
                showSuccess('Address saved successfully!');
                setIsSaveModalVisible(false);
                fetchSavedAddresses();
                setAddress(finalAddress);
                setSearchText(finalAddress);
                navigateToTrip(finalAddress, coordinate);
            } else {
                showError(message || 'Failed to save address.');
            }
        } catch (error: any) {
            showError(error?.message || 'Unable to save address.');
        } finally {
            setIsSavingAddress(false);
        }
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

                setCurrentCoordinate(newCoordinate);
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

    // Confirm pickup location directly without saving to /user/addresses
    const handleConfirmLocation = () => {
        if (!address.trim() && !coordinate.latitude) {
            showError('Please search or select a pickup address.');
            return;
        }
        Keyboard.dismiss();
        navigateToTrip(address, coordinate);
    };

    // Helper to get icon for saved address tag
    const getTagIcon = (addressTag: string) => {
        switch ((addressTag || '').toUpperCase()) {
            case 'HOME':
                return { name: 'home', bg: '#fee2e2', color: COLORS.primary };
            case 'WORK':
                return { name: 'briefcase', bg: '#e0e7ff', color: '#4f46e5' };
            default:
                return { name: 'location', bg: '#f1f5f9', color: '#64748b' };
        }
    };

    // ==========================================
    // 1. SELECT LOCATION SCREEN (PORTER STYLE)
    // ==========================================
    if (!showMap) {
        return (
            <SafeAreaView style={styles.screenContainer} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

                {/* Header */}
                <View style={styles.headerWrapper}>
                    <Header value="Select a location" />
                </View>

                {/* Main Content Sheet */}
                <SafeAreaView edges={['bottom']} style={styles.contentSheet}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                        {/* Primary Options Card */}
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

                        {/* Saved Addresses Section (from GET /user/addresses) */}
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>
                            <TouchableOpacity
                                onPress={fetchSavedAddresses}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="refresh" size={18} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {isLoadingAddresses ? (
                            <View style={styles.loadingAddressesBox}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                                <Text style={styles.loadingAddressesText}>Loading saved addresses...</Text>
                            </View>
                        ) : savedAddresses.length > 0 ? (
                            <View style={styles.cardContainer}>
                                {savedAddresses.map((item: any, index: number) => {
                                    const iconInfo = getTagIcon(item.tag);
                                    const title = item.tag || 'SAVED ADDRESS';
                                    const subAddress = item.formattedAddress || item.houseFlatFloor || '';
                                    const detailLine = [item.houseFlatFloor, item.apartmentRoadArea, item.landmark]
                                        .filter(Boolean)
                                        .join(', ');

                                    return (
                                        <View key={item.id || item._id || index}>
                                            <TouchableOpacity
                                                style={styles.cardRow}
                                                onPress={() => handleSelectSavedAddress(item)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
                                                    <Ionicons name={iconInfo.name as any} size={20} color={iconInfo.color} />
                                                </View>

                                                <View style={styles.cardTextWrapper}>
                                                    <View style={styles.tagTitleRow}>
                                                        <Text style={styles.cardTitle}>{title}</Text>
                                                        {item.isDefault ? (
                                                            <View style={styles.defaultBadge}>
                                                                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                                            </View>
                                                        ) : null}
                                                    </View>

                                                    {detailLine ? (
                                                        <Text style={styles.savedDetailText} numberOfLines={1}>
                                                            {detailLine}
                                                        </Text>
                                                    ) : null}

                                                    <Text style={styles.cardSubText} numberOfLines={2}>
                                                        {subAddress}
                                                    </Text>
                                                </View>

                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() => handleDeleteSavedAddress(item.id || item._id)}
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                                </TouchableOpacity>
                                            </TouchableOpacity>

                                            {index < savedAddresses.length - 1 && (
                                                <View style={styles.cardDivider} />
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={styles.emptySavedBox}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="bookmark-outline" size={26} color="#94a3b8" />
                                </View>
                                <Text style={styles.emptySavedTitle}>No saved addresses yet</Text>
                                <Text style={styles.emptySavedSubtitle}>
                                    Pick a location on the map and tap "Save Address" to quickly book trips in the future.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </SafeAreaView>
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
                style={StyleSheet.absoluteFill}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={region}
                onPress={handleMapPress}
                onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation={!!currentCoordinate}
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

            {/* Bottom Card for Location Confirmation & Save */}
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

                    <View style={styles.bottomButtonsRow}>
                        <TouchableOpacity
                            style={styles.saveOutlineButton}
                            onPress={handleOpenSaveModal}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="bookmark-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.saveOutlineButtonText}>Save Address</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirmLocation}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.confirmButtonText}>Confirm Pickup</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Save Address Details Modal (POST /user/addresses) */}
            <Modal
                visible={isSaveModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsSaveModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Save Address Details</Text>
                                <Text style={styles.modalSubtitle}>Save to your address book for fast booking</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setIsSaveModalVisible(false)}
                            >
                                <Ionicons name="close" size={22} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                            {/* Tag Selection: HOME / WORK / OTHER */}
                            <Text style={styles.fieldLabel}>SAVE AS *</Text>
                            <View style={styles.tagSelectorRow}>
                                {(['HOME', 'WORK', 'OTHER'] as const).map((item) => {
                                    const isSelected = tag === item;
                                    const iconName = item === 'HOME' ? 'home' : item === 'WORK' ? 'briefcase' : 'location';
                                    return (
                                        <TouchableOpacity
                                            key={item}
                                            style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
                                            onPress={() => setTag(item)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name={iconName as any}
                                                size={16}
                                                color={isSelected ? '#fff' : '#64748b'}
                                                style={{ marginRight: 6 }}
                                            />
                                            <Text style={[styles.tagButtonText, isSelected && styles.tagButtonTextSelected]}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Formatted Address (Editable) */}
                            <Text style={styles.fieldLabel}>SELECTED ADDRESS *</Text>
                            <View style={styles.addressEditableBox}>
                                <Ionicons
                                    name="location"
                                    size={18}
                                    color={COLORS.primary}
                                    style={{ marginRight: 8, marginTop: Platform.OS === 'ios' ? 2 : 4 }}
                                />
                                <TextInput
                                    style={styles.addressEditableInput}
                                    multiline
                                    placeholder="Enter or edit address..."
                                    placeholderTextColor="#94a3b8"
                                    value={editableAddress}
                                    onChangeText={setEditableAddress}
                                />
                            </View>

                            {/* House / Flat / Floor */}
                            <Text style={styles.fieldLabel}>
                                HOUSE / FLAT / BLOCK NO. <Text style={styles.requiredAsterisk}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. Flat 402, Block B"
                                placeholderTextColor="#94a3b8"
                                value={houseFlatFloor}
                                onChangeText={setHouseFlatFloor}
                            />

                            {/* Apartment / Road / Area */}
                            <Text style={styles.fieldLabel}>APARTMENT / ROAD / AREA (OPTIONAL)</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. Sobha Iris, Outer Ring Road"
                                placeholderTextColor="#94a3b8"
                                value={apartmentRoadArea}
                                onChangeText={setApartmentRoadArea}
                            />

                            {/* Landmark */}
                            <Text style={styles.fieldLabel}>LANDMARK (OPTIONAL)</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. Opposite Sakra Hospital"
                                placeholderTextColor="#94a3b8"
                                value={landmark}
                                onChangeText={setLandmark}
                            />

                            {/* Contact Details */}
                            <View style={styles.splitRow}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.fieldLabel}>CONTACT NAME</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. Rahul Sharma"
                                        placeholderTextColor="#94a3b8"
                                        value={contactName}
                                        onChangeText={setContactName}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.fieldLabel}>CONTACT PHONE</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. 9876543210"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="phone-pad"
                                        value={contactPhone}
                                        onChangeText={setContactPhone}
                                    />
                                </View>
                            </View>

                            {/* Instructions */}
                            <Text style={styles.fieldLabel}>INSTRUCTIONS (OPTIONAL)</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. Call on arrival"
                                placeholderTextColor="#94a3b8"
                                value={instructions}
                                onChangeText={setInstructions}
                            />

                            {/* Set Default Address Checkbox */}
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={() => setIsDefault(!isDefault)}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={isDefault ? 'checkbox' : 'square-outline'}
                                    size={20}
                                    color={isDefault ? COLORS.primary : '#94a3b8'}
                                />
                                <Text style={styles.checkboxLabel}>Set as default pickup address</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Modal Action Buttons */}
                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setIsSaveModalVisible(false)}
                                disabled={isSavingAddress}
                            >
                                <Text style={styles.modalCancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalSaveBtn,
                                    !houseFlatFloor.trim() && styles.modalSaveBtnDisabled,
                                ]}
                                onPress={handleSaveAddressSubmit}
                                disabled={isSavingAddress}
                            >
                                {isSavingAddress ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalSaveBtnText}>Save & Proceed</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        marginTop: 10,
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

    // Saved Addresses Section Styles
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 18,
        marginTop: 22,
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 0.8,
    },
    loadingAddressesBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    loadingAddressesText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#64748b',
    },
    tagTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    defaultBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 8,
    },
    defaultBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803d',
    },
    savedDetailText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    deleteButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptySavedBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 32,
    },
    emptyIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    emptySavedTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 4,
    },
    emptySavedSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 17,
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
        bottom: 220,
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
    bottomButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    saveOutlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        height: 50,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        backgroundColor: '#fff',
        marginRight: 10,
    },
    saveOutlineButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    confirmButton: {
        flex: 1,
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

    // Save Address Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 0.6,
        marginBottom: 6,
        marginTop: 10,
    },
    tagSelectorRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    tagButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        marginHorizontal: 4,
    },
    tagButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tagButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    tagButtonTextSelected: {
        color: '#ffffff',
    },
    addressEditableBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 56,
        marginBottom: 4,
    },
    addressEditableInput: {
        flex: 1,
        fontSize: 13,
        color: '#1e293b',
        lineHeight: 18,
        paddingTop: 0,
        paddingBottom: 0,
        textAlignVertical: 'top',
    },
    modalInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        height: 46,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#1e293b',
    },
    splitRow: {
        flexDirection: 'row',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 8,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 13,
        fontWeight: '500',
        color: '#334155',
    },
    modalActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    modalCancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    modalCancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    modalSaveBtn: {
        flex: 2,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    modalSaveBtnDisabled: {
        opacity: 0.55,
    },
    modalSaveBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
    },
    requiredAsterisk: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '700',
    },
});