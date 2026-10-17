import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../utils/ColorCode";

export interface ExitAppModalProps {
    visible?: boolean;
    onCancel?: () => void;
    onConfirm?: () => void;
    /**
     * If true (default), automatically listens to Android hardware back press
     * when the containing screen is focused and manages modal visibility.
     */
    autoHandleBack?: boolean;
}

const ExitAppModal: React.FC<ExitAppModalProps> = ({
    visible: controlledVisible,
    onCancel,
    onConfirm,
    autoHandleBack = true,
}) => {
    const [internalVisible, setInternalVisible] = useState<boolean>(false);

    const isVisible = controlledVisible !== undefined ? controlledVisible : internalVisible;

    // Listen to hardware back press on Android when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (!autoHandleBack) return;

            const onBackPress = () => {
                if (internalVisible) {
                    setInternalVisible(false);
                    return true;
                }
                setInternalVisible(true);
                return true;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription.remove();
        }, [autoHandleBack, internalVisible])
    );

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            setInternalVisible(false);
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            setInternalVisible(false);
            BackHandler.exitApp();
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-6">
                <View
                    className="w-full max-w-[340px] bg-white rounded-3xl p-6 items-center border border-slate-100"
                    style={{ elevation: 6 }}
                >
                    {/* Exit Icon Circle */}
                    <View className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 justify-center items-center mb-3.5">
                        <Ionicons name="log-out-outline" size={28} color={COLORS.primary} />
                    </View>

                    {/* Title & Subtitle */}
                    <Text className="text-[20px] font-black text-slate-900 text-center tracking-tight mb-1">
                        Exit Application?
                    </Text>
                    <Text className="text-[13px] text-slate-500 font-medium text-center mb-6 leading-5 px-2">
                        Are you sure you want to close and exit the RTR app?
                    </Text>

                    {/* Action Buttons */}
                    <View className="w-full flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="flex-1 h-12 bg-slate-100 rounded-xl justify-center items-center"
                            activeOpacity={0.7}
                        >
                            <Text className="text-[14px] font-bold text-slate-700">
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirm}
                            className="flex-1 h-12 bg-[#E0211F] rounded-xl justify-center items-center shadow-sm"
                            style={{ elevation: 2 }}
                            activeOpacity={0.8}
                        >
                            <Text className="text-[14px] font-bold text-white">
                                Exit App
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ExitAppModal;
