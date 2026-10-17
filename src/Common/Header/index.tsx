import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../utils/ColorCode";

export interface HeaderProps {
    value?: string;
    title?: string;
    edit?: boolean;
    clickEdit?: () => void;
    backNavigate?: string | boolean | (() => void);
    onBack?: () => void;
    showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    value,
    title,
    edit,
    clickEdit,
    backNavigate,
    onBack,
    showBack = true,
}) => {
    const navigation: any = useNavigation();

    const handleEdit = () => {
        if (typeof clickEdit === "function") {
            clickEdit();
        }
    };

    const handleBack = () => {
        // 1. Explicit callback function provided via onBack
        if (typeof onBack === "function") {
            onBack();
            return;
        }

        // 2. Explicit callback function provided via backNavigate
        if (typeof backNavigate === "function") {
            backNavigate();
            return;
        }

        // 3. Explicit route name string provided (e.g. "OwnerHome", "Trip")
        if (typeof backNavigate === "string" && backNavigate.length > 0) {
            navigation.navigate(backNavigate);
            return;
        }

        // 4. Smart loop prevention for stack history: A -> B -> C -> B
        // Ensures clean linear back progression: C -> B -> A without cyclic loops
        try {
            const state: any = navigation.getState();
            if (state && Array.isArray(state.routes) && state.routes.length > 1) {
                const currentIndex = typeof state.index === "number" ? state.index : state.routes.length - 1;
                const currentRoute = state.routes[currentIndex];
                const currentName = currentRoute?.name;

                if (currentName) {
                    const firstIndex = state.routes.findIndex((r: any) => r.name === currentName);
                    // If current screen appeared earlier in the stack (e.g. second B in [A, B, C, B])
                    if (firstIndex >= 0 && firstIndex < currentIndex) {
                        const targetRoute = state.routes[firstIndex - 1];
                        if (targetRoute?.name) {
                            navigation.navigate(targetRoute.name, targetRoute.params);
                            return;
                        }
                    }
                }
            }

            // If in a drawer navigator screen, return cleanly to Home
            if (state?.type === "drawer") {
                navigation.navigate("Home");
                return;
            }
        } catch (e) {
            console.warn("Header back navigation resolution error:", e);
        }

        // 5. If backNavigate was boolean true
        if (backNavigate === true) {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.navigate("OwnerHome");
            }
            return;
        }

        // 6. Default standard goBack if stack history exists, otherwise fallback to OwnerHome
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate("OwnerHome");
        }
    };

    const headerTitle = value || title || "";

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary }}>
            <View style={{ width: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <View style={{ width: "15%", justifyContent: "center", alignItems: "center" }}>
                    {showBack !== false && (
                        <TouchableOpacity
                            onPress={handleBack}
                            style={{ width: "100%", height: 44, justifyContent: "center", alignItems: "center" }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" color={"white"} size={24} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ width: "70%", justifyContent: "center", alignItems: "center" }}>
                    <Text
                        style={{ textAlign: "center", fontSize: 18, fontWeight: "bold", color: COLORS.white }}
                        numberOfLines={1}
                    >
                        {headerTitle}
                    </Text>
                </View>

                <View style={{ width: "15%", justifyContent: "center", alignItems: "center" }}>
                    {edit && (
                        <TouchableOpacity
                            onPress={handleEdit}
                            style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4 }}
                            activeOpacity={0.7}
                        >
                            <Text className="text-white font-bold text-[18px]">Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

export default Header;