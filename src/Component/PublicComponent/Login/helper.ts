import axios from "axios";
import { baseUrl, loginUrl, forgetBaseUrl, forget, deviceBaseUrl, OneSignalAPi } from "../../../../environment/ApiManager/index";


export const FetchLogin = (data: any) => {
    return axios.post(`${baseUrl}${loginUrl}`, data);
}

export const VerifyingMail = (data:any) => {
    return axios.post(`${forgetBaseUrl}${forget.verifyEmail}`, data);
}

export const verifyingOtp = (data:any) => {
    return axios.post(`${forgetBaseUrl}${forget.verifyOtp}`, data);
}

export const forgetedPassword = (data:any) => {
    return axios.post(`${forgetBaseUrl}${forget.forgetPassword}`, data);
}

export const oneSignalservice = (token: any, data: any) => {
    return axios.post(`${baseUrl}${OneSignalAPi.UserDevices}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
}