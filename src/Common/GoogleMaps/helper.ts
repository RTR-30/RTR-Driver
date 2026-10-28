import { Get, Post, Delete } from "../HttpService";
import { baseUrl, userAddresses } from "../../../environment/ApiManager";

export interface AddressPayload {
    tag: string; // 'HOME' | 'WORK' | 'OTHER'
    formattedAddress: string;
    houseFlatFloor?: string;
    apartmentRoadArea?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude: number;
    longitude: number;
    contactName?: string;
    contactPhone?: string;
    instructions?: string;
    isDefault?: boolean;
}

export const getAddressesService = async () => {
    return Get(`${baseUrl}${userAddresses}`, "rtrToken");
};

export const addAddressService = async (payload: AddressPayload) => {
    return Post(`${baseUrl}${userAddresses}`, payload, "rtrToken");
};

export const getAddressByIdService = async (id: string | number) => {
    return Get(`${baseUrl}${userAddresses}/${id}`, "rtrToken");
};

export const deleteAddressService = async (id: string | number) => {
    return Delete(`${baseUrl}${userAddresses}/${id}`, {}, "rtrToken");
};
