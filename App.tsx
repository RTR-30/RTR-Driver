

import NavigationPage from "./src/AuthComponent/index";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {OneSignal, LogLevel} from 'react-native-onesignal';
import { AppID } from "./environment/ApiManager";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";

const App = () => {
  const [UserId, setUserId] = useState<any>(null);
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  OneSignal.initialize(AppID);
  OneSignal.Notifications.requestPermission(true);

  const fetchUserId = async () => {
    const userId = await OneSignal.User.getOnesignalId();
    if (userId) {
      setUserId(userId)
      await AsyncStorage.setItem('ONESIGNAL_PLAYER_ID', userId);
    }
  };

  useEffect(()=>{
    fetchUserId();
  }, []);
  
  return (
    <>
      {UserId ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationPage />
        </GestureHandlerRootView>
      ) : null}
    </>
  )
}

export default App;