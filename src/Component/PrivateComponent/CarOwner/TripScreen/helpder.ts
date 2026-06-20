import axios from "axios";
import { paymentBaseUrl, tripTypeApi } from "../../../../../environment/ApiManager";

export const tripTypeService = async (token: any) => {
    return axios.get(`${paymentBaseUrl}${tripTypeApi.tripTypes}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}