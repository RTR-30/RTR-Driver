import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

const DriverInfoModal = ({ visible, onClose, partnerDetails }:any) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-xl w-[85%] p-5 shadow-lg">
          <Text className="text-lg font-bold mb-4">Driver Info</Text>

          <Text className="text-base mb-2">Name : {partnerDetails?.fullname}</Text>
          <Text className="text-base mb-2">Email : {partnerDetails?.email}</Text>
          <Text className="text-base mb-2">Mobile no : {partnerDetails?.mobileno}</Text>
          <Text className="text-base mb-2">Aadhaar : {partnerDetails?.aadhaar}</Text>
          <Text className="text-base mb-2">License no : {partnerDetails?.licensenumber}</Text>

          <TouchableOpacity onPress={onClose} className="self-end mt-4">
            <Text className="text-teal-600 font-semibold">OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DriverInfoModal;
