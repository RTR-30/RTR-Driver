import axios from "axios";
import { BaseUrl, profileUpdate, userDetails } from "../../../../../environment/ApiManager/index";

export const FetchProfileUpdate = (userId:any, formData:any) => {
    return axios.put(BaseUrl + profileUpdate + userId , formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};

export const FetchUsers = (userId:any) => {
    return axios.get(BaseUrl + userDetails + userId,{
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

