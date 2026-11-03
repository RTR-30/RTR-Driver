import NavigationPage from "./src/AuthComponent/index";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { AppID } from "./environment/ApiManager";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar, AppState, AppStateStatus } from "react-native";
import { enableBackgroundIconSync, syncIconNow } from "./src/services/festivalIcon";

const App = () => {
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  OneSignal.initialize(AppID);
  OneSignal.Notifications.requestPermission(true);

  const fetchUserId = async () => {
    try {
      const userId = await OneSignal.User.getOnesignalId();
      if (userId) {
        await AsyncStorage.setItem('ONESIGNAL_PLAYER_ID', userId);
      }
    } catch (e) {
      console.warn("OneSignal getOnesignalId error:", e);
    }
  };

  useEffect(() => {
    fetchUserId();

    // 1. Initialize WorkManager background periodic scheduler
    enableBackgroundIconSync();

    // 2. Perform immediate sync on app launch
    syncIconNow();

    // 3. Re-sync when app transitions back to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        syncIconNow();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationPage />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
